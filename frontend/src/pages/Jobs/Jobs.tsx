import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  salary?: string;
  employmentType: string;
  skills: string[];
  status: "Active" | "Closed";
  createdAt: string;
}

interface JobForm {
  title: string;
  description: string;
  location: string;
  salary: string;
  employmentType: string;
  skills: string;
  status: "Active" | "Closed";
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalJobs: number;
  limit: number;
}

const emptyForm: JobForm = {
  title: "",
  description: "",
  location: "",
  salary: "",
  employmentType: "Full-time",
  skills: "",
  status: "Active",
};

function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState<JobForm>(emptyForm);

  const [editingJobId, setEditingJobId] = useState<string | null>(
    null
  );

  // Search / filter / sort / pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    limit: 5,
  });

  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // FETCH JOBS
  // ==========================================

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await axios.get("/api/jobs", {
        params: {
          search,
          status: statusFilter,
          sort,
          page: currentPage,
          limit: 5,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(response.data.jobs || []);

      setPagination(
        response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalJobs: 0,
          limit: 5,
        }
      );
    } catch (error) {
      console.error("FETCH JOBS ERROR:", error);

      if (axios.isAxiosError(error)) {
        console.error("STATUS:", error.response?.status);
        console.error("RESPONSE:", error.response?.data);

        setError(
          error.response?.data?.message ||
            "Could not load jobs."
        );
      } else {
        setError("Could not load jobs.");
      }
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter, sort, currentPage]);

  // ==========================================
  // FORM INPUT
  // ==========================================

  const handleInputChange = (
    field: keyof JobForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // ==========================================
  // CREATE / UPDATE JOB
  // ==========================================

  const handleSubmitJob = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const jobData = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        salary: form.salary.trim(),
        employmentType: form.employmentType,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        status: form.status,
      };

      let response;

      if (editingJobId) {
        response = await axios.put(
          `/api/jobs/${editingJobId}`,
          jobData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          "/api/jobs",
          jobData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setMessage(
        response.data.message ||
          (editingJobId
            ? "Job updated successfully."
            : "Job created successfully.")
      );

      setForm(emptyForm);
      setEditingJobId(null);

      setCurrentPage(1);
      await fetchJobs();
    } catch (error) {
      console.error("SAVE JOB ERROR:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not save job."
        );
      } else {
        setError("Could not save job.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EDIT JOB
  // ==========================================

  const handleEditJob = (job: Job) => {
    setMessage("");
    setError("");

    setEditingJobId(job._id);

    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary || "",
      employmentType: job.employmentType,
      skills: job.skills.join(", "),
      status: job.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // VIEW JOB
  // ==========================================

  const handleViewJob = (id: string) => {
    navigate(`/jobs/${id}`);
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  // ==========================================
  // DELETE JOB
  // ==========================================

  const handleDeleteJob = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await axios.delete(
        `/api/jobs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Job deleted successfully."
      );

      if (editingJobId === id) {
        handleCancelEdit();
      }

      await fetchJobs();
    } catch (error) {
      console.error("DELETE JOB ERROR:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not delete job."
        );
      } else {
        setError("Could not delete job.");
      }
    }
  };

  // ==========================================
  // SEARCH CHANGE
  // ==========================================

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // ==========================================
  // STATUS FILTER CHANGE
  // ==========================================

  const handleStatusChange = (
    value: string
  ) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // ==========================================
  // SORT CHANGE
  // ==========================================

  const handleSortChange = (
    value: string
  ) => {
    setSort(value);
    setCurrentPage(1);
  };

  // ==========================================
  // PREVIOUS PAGE
  // ==========================================

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((page) => page - 1);
    }
  };

  // ==========================================
  // NEXT PAGE
  // ==========================================

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage((page) => page + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Jobs
        </h1>

        <p className="mt-2 text-slate-600">
          Create and manage your job openings.
        </p>
      </div>

      {/* ==========================================
          MESSAGES
      ========================================== */}

      {message && (
        <div className="rounded-lg bg-green-100 p-4 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* ==========================================
          CREATE / EDIT FORM
      ========================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">
            {editingJobId
              ? "Edit Job"
              : "Create New Job"}
          </h2>

          {editingJobId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmitJob}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          {/* Job Title */}
          <input
            type="text"
            placeholder="Job title"
            value={form.title}
            onChange={(e) =>
              handleInputChange(
                "title",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
            required
          />

          {/* Location */}
          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              handleInputChange(
                "location",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
            required
          />

          {/* Salary */}
          <input
            type="text"
            placeholder="Salary"
            value={form.salary}
            onChange={(e) =>
              handleInputChange(
                "salary",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* Employment Type */}
          <select
            value={form.employmentType}
            onChange={(e) =>
              handleInputChange(
                "employmentType",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="Full-time">
              Full-time
            </option>

            <option value="Part-time">
              Part-time
            </option>

            <option value="Contract">
              Contract
            </option>

            <option value="Internship">
              Internship
            </option>
          </select>

          {/* Status */}
          <select
            value={form.status}
            onChange={(e) =>
              handleInputChange(
                "status",
                e.target.value as
                  | "Active"
                  | "Closed"
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="Active">
              Active
            </option>

            <option value="Closed">
              Closed
            </option>
          </select>

          {/* Description */}
          <textarea
            placeholder="Job description"
            value={form.description}
            onChange={(e) =>
              handleInputChange(
                "description",
                e.target.value
              )
            }
            className="min-h-32 rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900 md:col-span-2"
            required
          />

          {/* Skills */}
          <input
            type="text"
            placeholder="Skills (React, TypeScript, Node.js)"
            value={form.skills}
            onChange={(e) =>
              handleInputChange(
                "skills",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900 md:col-span-2"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
          >
            {loading
              ? editingJobId
                ? "Updating..."
                : "Creating..."
              : editingJobId
              ? "Update Job"
              : "Create Job"}
          </button>
        </form>
      </div>

      {/* ==========================================
          SEARCH / FILTER / SORT
      ========================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Find Jobs
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search title, location, description..."
            value={search}
            onChange={(e) =>
              handleSearchChange(
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              handleStatusChange(
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">
              All statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Closed">
              Closed
            </option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) =>
              handleSortChange(
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="newest">
              Newest first
            </option>

            <option value="oldest">
              Oldest first
            </option>

            <option value="titleAsc">
              Title A → Z
            </option>

            <option value="titleDesc">
              Title Z → A
            </option>
          </select>
        </div>
      </div>

      {/* ==========================================
          JOBS LIST
      ========================================== */}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Your Jobs
          </h2>

          <span className="text-sm text-slate-500">
            {pagination.totalJobs}{" "}
            {pagination.totalJobs === 1
              ? "job"
              : "jobs"}
          </span>
        </div>

        {loadingJobs ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No jobs found.
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row">
                  {/* Job Information */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900">
                        {job.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          job.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <p className="mt-2 text-slate-600">
                      {job.location} •{" "}
                      {job.employmentType}
                    </p>

                    {job.salary && (
                      <p className="mt-1 text-slate-500">
                        Salary: {job.salary}
                      </p>
                    )}

                    <p className="mt-4 leading-7 text-slate-700">
                      {job.description}
                    </p>

                    {job.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.map(
                          (skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    <p className="mt-4 text-sm text-slate-400">
                      Created:{" "}
                      {new Date(
                        job.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Job Actions */}
                  <div className="flex h-fit flex-wrap gap-2">
                    {/* View */}
                    <button
                      type="button"
                      onClick={() =>
                        handleViewJob(
                          job._id
                        )
                      }
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() =>
                        handleEditJob(job)
                      }
                      className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteJob(
                          job._id
                        )
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==========================================
          PAGINATION
      ========================================== */}

      {!loadingJobs &&
        pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={
                handlePreviousPage
              }
              disabled={
                currentPage === 1
              }
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-sm font-medium text-slate-600">
              Page{" "}
              {pagination.currentPage}{" "}
              of{" "}
              {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={
                handleNextPage
              }
              disabled={
                currentPage ===
                pagination.totalPages
              }
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
    </div>
  );
}

export default Jobs;