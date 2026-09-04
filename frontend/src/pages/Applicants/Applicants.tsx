import { useEffect, useState } from "react";
import axios from "axios";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

interface Job {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  skills?: string[];
}

interface Applicant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  state?: string;
  graduationYear?: number;
  jobExpectation?: string;
  skills?: string[];
  resume?: string;

  matchScore?: number;
  matchingSkills?: string[];
  missingSkills?: string[];

  job: Job;
  status:
    | "Applied"
    | "Screening"
    | "Shortlisted"
    | "Interview"
    | "Rejected"
    | "Hired";
  appliedAt: string;
}

interface ApplicantForm {
  name: string;
  email: string;
  phone: string;
  college: string;
  state: string;
  graduationYear: string;
  jobExpectation: string;
  skills: string;
  job: string;
  status:
    | "Applied"
    | "Screening"
    | "Shortlisted"
    | "Interview"
    | "Rejected"
    | "Hired";
}

const emptyForm: ApplicantForm = {
  name: "",
  email: "",
  phone: "",
  college: "",
  state: "",
  graduationYear: "",
  jobExpectation: "",
  skills: "",
  job: "",
  status: "Applied",
};

function Applicants() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const selectedJobId =
    searchParams.get("job") || "";

  const editApplicantId =
    searchParams.get("edit") || "";

  const [applicants, setApplicants] =
    useState<Applicant[]>([]);

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [form, setForm] =
    useState<ApplicantForm>(emptyForm);

  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [editingApplicantId, setEditingApplicantId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [sort, setSort] =
    useState("newest");

  const [loading, setLoading] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =========================
  // FETCH APPLICANTS
  // =========================

  const fetchApplicants = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "You are not logged in."
        );
        return;
      }

      const response =
        await axios.get(
          "/api/applicants",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setApplicants(
        response.data.applicants || []
      );
    } catch (error) {
      console.error(
        "FETCH APPLICANTS ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not load applicants."
        );
      } else {
        setError(
          "Could not load applicants."
        );
      }
    }
  };

  // =========================
  // FETCH JOBS
  // =========================

  const fetchJobs = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "You are not logged in."
        );
        return;
      }

      const response =
        await axios.get(
          "/api/jobs",
          {
            params: {
              page: 1,
              limit: 50,
              sort: "newest",
            },
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setJobs(
        response.data.jobs || []
      );
    } catch (error) {
      console.error(
        "FETCH JOBS ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not load jobs."
        );
      } else {
        setError(
          "Could not load jobs."
        );
      }
    }
  };

  // =========================
  // LOAD INITIAL DATA
  // =========================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        await Promise.all([
          fetchApplicants(),
          fetchJobs(),
        ]);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // =========================
  // FORM INPUT
  // =========================

  const handleInputChange = (
    field: keyof ApplicantForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // =========================
  // RESUME FILE
  // =========================

  const handleResumeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0] || null;

    if (!file) {
      setResumeFile(null);
      return;
    }

    if (
      file.type !==
        "application/pdf" &&
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Only PDF resume files are allowed."
      );

      e.target.value = "";
      setResumeFile(null);
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Resume must be smaller than 5 MB."
      );

      e.target.value = "";
      setResumeFile(null);
      return;
    }

    setError("");
    setResumeFile(file);
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      ...emptyForm,
      job: selectedJobId,
    });

    setResumeFile(null);
    setEditingApplicantId(null);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (
    applicant: Applicant
  ) => {
    setMessage("");
    setError("");

    setEditingApplicantId(
      applicant._id
    );

    setForm({
      name: applicant.name,
      email: applicant.email,
      phone:
        applicant.phone || "",
      college:
        applicant.college || "",
      state:
        applicant.state || "",
      graduationYear:
        applicant.graduationYear?.toString() ||
        "",
      jobExpectation:
        applicant.jobExpectation ||
        "",
      skills:
        applicant.skills?.join(
          ", "
        ) || "",
      job:
        typeof applicant.job ===
        "object"
          ? applicant.job._id
          : String(
              applicant.job
            ),
      status: applicant.status,
    });

    setResumeFile(null);

    // Remove edit parameter after opening the form
    navigate(
      `/applicants${
        selectedJobId
          ? `?job=${selectedJobId}`
          : ""
      }`,
      {
        replace: true,
      }
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // OPEN EDIT FROM URL
  // =========================

  useEffect(() => {
    if (
      !editApplicantId ||
      applicants.length === 0
    ) {
      return;
    }

    const applicantToEdit =
      applicants.find(
        (applicant) =>
          applicant._id ===
          editApplicantId
      );

    if (applicantToEdit) {
      handleEdit(
        applicantToEdit
      );
    }
  }, [
    editApplicantId,
    applicants,
  ]);

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "You are not logged in."
        );
        return;
      }

      if (!form.job) {
        setError(
          "Please select a job."
        );
        return;
      }

      if (
        !editingApplicantId &&
        !resumeFile
      ) {
        setError(
          "Please attach a PDF resume."
        );
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "email",
        form.email.trim()
      );

      formData.append(
        "phone",
        form.phone.trim()
      );

      formData.append(
        "college",
        form.college.trim()
      );

      formData.append(
        "state",
        form.state.trim()
      );

      formData.append(
        "graduationYear",
        form.graduationYear
      );

      formData.append(
        "jobExpectation",
        form.jobExpectation.trim()
      );

      // =========================
      // SKILLS
      // =========================

      const skillsArray =
        form.skills
          .split(",")
          .map((skill) =>
            skill.trim()
          )
          .filter(Boolean);

      formData.append(
        "skills",
        JSON.stringify(
          skillsArray
        )
      );

      formData.append(
        "job",
        form.job
      );

      formData.append(
        "status",
        form.status
      );

      if (resumeFile) {
        formData.append(
          "resume",
          resumeFile
        );
      }

      let response;

      if (editingApplicantId) {
        response =
          await axios.put(
            `/api/applicants/${editingApplicantId}`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );
      } else {
        response =
          await axios.post(
            "/api/applicants",
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );
      }

      setMessage(
        response.data.message ||
          (editingApplicantId
            ? "Applicant updated successfully."
            : "Applicant created successfully.")
      );

      resetForm();

      await fetchApplicants();
    } catch (error) {
      console.error(
        "SAVE APPLICANT ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not save applicant."
        );
      } else {
        setError(
          "Could not save applicant."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancelEdit = () => {
    resetForm();
    setMessage("");
    setError("");
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this applicant?"
      );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "You are not logged in."
        );
        return;
      }

      const response =
        await axios.delete(
          `/api/applicants/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setMessage(
        response.data.message ||
          "Applicant deleted successfully."
      );

      if (
        editingApplicantId === id
      ) {
        resetForm();
      }

      await fetchApplicants();
    } catch (error) {
      console.error(
        "DELETE APPLICANT ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not delete applicant."
        );
      } else {
        setError(
          "Could not delete applicant."
        );
      }
    }
  };

  // =========================
  // VIEW APPLICANT
  // =========================

  const handleViewApplicant = (
    id: string
  ) => {
    navigate(`/applicants/${id}`);
  };

  // =========================
  // CHANGE APPLICANT STATUS
  // =========================

  const handleStatusUpdate = async (
    applicant: Applicant,
    newStatus: Applicant["status"]
  ) => {
    if (
      applicant.status ===
      newStatus
    ) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "You are not logged in."
        );
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "status",
        newStatus
      );

      const response =
        await axios.put(
          `/api/applicants/${applicant._id}`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setMessage(
        response.data.message ||
          "Applicant status updated successfully."
      );

      await fetchApplicants();
    } catch (error) {
      console.error(
        "UPDATE APPLICANT STATUS ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not update applicant status."
        );
      } else {
        setError(
          "Could not update applicant status."
        );
      }
    }
  };

  // =========================
  // FILTER + SEARCH + SORT
  // =========================

  const filteredApplicants =
    applicants
      .filter((applicant) => {
        if (!selectedJobId) {
          return true;
        }

        const applicantJobId =
          typeof applicant.job ===
          "object"
            ? applicant.job?._id
            : String(
                applicant.job
              );

        return (
          applicantJobId ===
          selectedJobId
        );
      })
      .filter((applicant) => {
        const searchText =
          search
            .toLowerCase()
            .trim();

        if (!searchText) {
          return true;
        }

        return (
          applicant.name
            .toLowerCase()
            .includes(searchText) ||
          applicant.email
            .toLowerCase()
            .includes(searchText) ||
          applicant.phone
            ?.toLowerCase()
            .includes(searchText) ||
          applicant.college
            ?.toLowerCase()
            .includes(searchText) ||
          applicant.state
            ?.toLowerCase()
            .includes(searchText) ||
          applicant.job?.title
            ?.toLowerCase()
            .includes(searchText) ||
          applicant.skills?.some(
            (skill) =>
              skill
                .toLowerCase()
                .includes(searchText)
          )
        );
      })
      .filter((applicant) => {
        if (!statusFilter) {
          return true;
        }

        return (
          applicant.status ===
          statusFilter
        );
      })
      .sort((a, b) => {
        if (sort === "nameAsc") {
          return a.name.localeCompare(
            b.name
          );
        }

        if (sort === "nameDesc") {
          return b.name.localeCompare(
            a.name
          );
        }

        if (sort === "matchHigh") {
          return (
            (b.matchScore ?? 0) -
            (a.matchScore ?? 0)
          );
        }

        if (sort === "matchLow") {
          return (
            (a.matchScore ?? 0) -
            (b.matchScore ?? 0)
          );
        }

        if (sort === "oldest") {
          return (
            new Date(
              a.appliedAt
            ).getTime() -
            new Date(
              b.appliedAt
            ).getTime()
          );
        }

        return (
          new Date(
            b.appliedAt
          ).getTime() -
          new Date(
            a.appliedAt
          ).getTime()
        );
      });

  // =========================
  // TOP CANDIDATES
  // =========================

  const topCandidates =
    applicants
      .filter((applicant) => {
        if (selectedJobId) {
          const applicantJobId =
            typeof applicant.job ===
            "object"
              ? applicant.job?._id
              : String(
                  applicant.job
                );

          return (
            applicantJobId ===
            selectedJobId
          );
        }

        return true;
      })
      .filter(
        (applicant) =>
          (applicant.matchScore ??
            0) >= 80
      )
      .sort(
        (a, b) =>
          (b.matchScore ?? 0) -
          (a.matchScore ?? 0)
      )
      .slice(0, 6);

  // =========================
  // SELECTED JOB
  // =========================

  const selectedJob =
    jobs.find(
      (job) =>
        job._id === selectedJobId
    );

  // =========================
  // LOADING
  // =========================

  if (loadingData) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading applicants...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Applicants
        </h1>

        <p className="mt-2 text-slate-600">
          Add and manage candidates for your job openings.
        </p>
      </div>

      {/* TOP CANDIDATES */}

      {topCandidates.length > 0 && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Top Candidates
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Best candidates based on skill matching.
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              {topCandidates.length} Top{" "}
              {topCandidates.length === 1
                ? "Candidate"
                : "Candidates"}
            </span>

          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {topCandidates.map(
              (applicant) => (
                <button
                  key={
                    applicant._id
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      `/applicants/${applicant._id}`
                    )
                  }
                  className="rounded-xl border border-green-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {
                          applicant.name
                        }
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {
                          applicant.job
                            ?.title ||
                          "Unknown Job"
                        }
                      </p>

                    </div>

                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                      {
                        applicant.matchScore ??
                        0
                      }
                      %
                    </span>

                  </div>

                  {applicant.matchingSkills &&
                    applicant.matchingSkills
                      .length >
                      0 && (
                    <div className="mt-4">

                      <p className="mb-2 text-xs font-semibold text-slate-500">
                        Matching Skills
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {applicant.matchingSkills
                          .slice(0, 5)
                          .map(
                            (
                              skill,
                              index
                            ) => (
                              <span
                                key={`${applicant._id}-top-skill-${index}`}
                                className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700"
                              >
                                {skill}
                              </span>
                            )
                          )}

                      </div>

                    </div>
                  )}

                  {applicant.missingSkills &&
                    applicant.missingSkills
                      .length >
                      0 && (
                    <p className="mt-3 text-xs text-slate-400">
                      {
                        applicant.missingSkills
                          .length
                      }{" "}
                      missing{" "}
                      {
                        applicant.missingSkills
                          .length ===
                        1
                          ? "skill"
                          : "skills"
                      }
                    </p>
                  )}

                  <p className="mt-4 text-xs font-semibold text-green-600">
                    View Candidate →
                  </p>

                </button>
              )
            )}

          </div>

        </div>
      )}

      {/* SELECTED JOB BANNER */}

      {selectedJob && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

            <div>
              <p className="text-sm font-medium text-blue-600">
                Applicants for job
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {
                  selectedJob.title
                }
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {
                  selectedJob.location
                }{" "}
                •{" "}
                {
                  selectedJob.employmentType
                }
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.history.back()
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Back
            </button>

          </div>

        </div>
      )}

      {/* MESSAGES */}

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

      {/* ADD / EDIT APPLICANT */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between gap-4">

          <h2 className="text-xl font-bold text-slate-900">
            {editingApplicantId
              ? "Edit Applicant"
              : selectedJob
              ? `Add Applicant to ${selectedJob.title}`
              : "Add Applicant"}
          </h2>

          {editingApplicantId && (
            <button
              type="button"
              onClick={
                handleCancelEdit
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}

        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >

          {/* NAME */}

          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) =>
              handleInputChange(
                "name",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
            required
          />

          {/* EMAIL */}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              handleInputChange(
                "email",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
            required
          />

          {/* PHONE */}

          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              handleInputChange(
                "phone",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* COLLEGE */}

          <input
            type="text"
            placeholder="College name"
            value={form.college}
            onChange={(e) =>
              handleInputChange(
                "college",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* STATE */}

          <input
            type="text"
            placeholder="State"
            value={form.state}
            onChange={(e) =>
              handleInputChange(
                "state",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* GRADUATION */}

          <input
            type="number"
            placeholder="Year of graduation"
            min="1900"
            max="2100"
            value={
              form.graduationYear
            }
            onChange={(e) =>
              handleInputChange(
                "graduationYear",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* JOB */}

          <select
            value={form.job}
            onChange={(e) =>
              handleInputChange(
                "job",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
            required
          >
            <option value="">
              Select job applied for
            </option>

            {jobs.map(
              (job) => (
                <option
                  key={job._id}
                  value={job._id}
                >
                  {job.title} —{" "}
                  {job.location}
                </option>
              )
            )}
          </select>

          {/* STATUS */}

          <select
            value={form.status}
            onChange={(e) =>
              handleInputChange(
                "status",
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="Applied">
              Applied
            </option>

            <option value="Screening">
              Screening
            </option>

            <option value="Shortlisted">
              Shortlisted
            </option>

            <option value="Interview">
              Interview
            </option>

            <option value="Rejected">
              Rejected
            </option>

            <option value="Hired">
              Hired
            </option>
          </select>

          {/* SKILLS */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Skills
            </label>

            <input
              type="text"
              placeholder="React, JavaScript, TypeScript, CSS"
              value={form.skills}
              onChange={(e) =>
                handleInputChange(
                  "skills",
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
            />

            <p className="mt-1 text-xs text-slate-400">
              Enter skills separated by commas.
            </p>

          </div>

          {/* JOB EXPECTATION */}

          <textarea
            placeholder={`What does the applicant expect from this job?
[equal or less than 100]`}
            value={
              form.jobExpectation
            }
            onChange={(e) =>
              handleInputChange(
                "jobExpectation",
                e.target.value
              )
            }
            className="min-h-28 rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900 md:col-span-2"
          />

          {/* RESUME */}

          <div className="md:col-span-2">

            <label className="block text-sm font-medium text-slate-700">
              Resume PDF
            </label>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={
                handleResumeChange
              }
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3 text-sm"
            />

            {resumeFile && (
              <p className="mt-2 text-sm text-green-600">
                Selected:{" "}
                {
                  resumeFile.name
                }
              </p>
            )}

            {editingApplicantId &&
              !resumeFile && (
                <p className="mt-2 text-sm text-slate-500">
                  Leave empty to keep the existing resume.
                </p>
              )}

            <p className="mt-1 text-xs text-slate-400">
              PDF only • Maximum 5 MB
            </p>

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              loading ||
              jobs.length === 0
            }
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
          >
            {loading
              ? editingApplicantId
                ? "Updating..."
                : "Adding..."
              : editingApplicantId
              ? "Update Applicant"
              : "Add Applicant"}
          </button>

        </form>

        {jobs.length === 0 && (
          <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
            Create at least one job before adding an applicant.
          </p>
        )}

      </div>

      {/* SEARCH / FILTER / SORT */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Find Applicants
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and filter your candidates.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            Showing{" "}
            {
              filteredApplicants.length
            }{" "}
            of{" "}
            {
              selectedJobId
                ? applicants.filter(
                    (applicant) => {
                      const applicantJobId =
                        typeof applicant.job ===
                        "object"
                          ? applicant.job?._id
                          : String(
                              applicant.job
                            );

                      return (
                        applicantJobId ===
                        selectedJobId
                      );
                    }
                  ).length
                : applicants.length
            }
          </span>

        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search name, email, skills, college, state, job..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* STATUS FILTER */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">
              All statuses
            </option>

            <option value="Applied">
              Applied
            </option>

            <option value="Screening">
              Screening
            </option>

            <option value="Shortlisted">
              Shortlisted
            </option>

            <option value="Interview">
              Interview
            </option>

            <option value="Rejected">
              Rejected
            </option>

            <option value="Hired">
              Hired
            </option>
          </select>

          {/* SORT */}

          <select
            value={sort}
            onChange={(e) =>
              setSort(
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

            <option value="matchHigh">
              Match score: High → Low
            </option>

            <option value="matchLow">
              Match score: Low → High
            </option>

            <option value="nameAsc">
              Name A → Z
            </option>

            <option value="nameDesc">
              Name Z → A
            </option>
          </select>

        </div>
      </div>

      {/* APPLICANT LIST */}

      <div>

        <div className="mb-4 flex items-center justify-between">

          <h2 className="text-xl font-bold text-slate-900">
            {selectedJob
              ? `Applicants for ${selectedJob.title}`
              : "All Applicants"}
          </h2>

          <span className="text-sm text-slate-500">
            {
              filteredApplicants.length
            }{" "}
            {filteredApplicants.length ===
            1
              ? "applicant"
              : "applicants"}
          </span>

        </div>

        {filteredApplicants.length ===
        0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">

            {selectedJob
              ? "No applicants have been added for this job yet."
              : applicants.length ===
                0
              ? "No applicants added yet."
              : "No applicants match your search or filter."}

          </div>
        ) : (
          <div className="grid gap-4">

            {filteredApplicants.map(
              (applicant) => (
                <div
                  key={
                    applicant._id
                  }
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col justify-between gap-5 lg:flex-row">

                    <div className="flex-1">

                      {/* NAME + STATUS */}

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-bold text-slate-900">
                          {
                            applicant.name
                          }
                        </h3>

                        {/* TOP CANDIDATE */}

                        {(applicant.matchScore ??
                          0) >=
                          80 && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Top Candidate
                          </span>
                        )}

                        <select
                          value={
                            applicant.status
                          }
                          onChange={(e) =>
                            handleStatusUpdate(
                              applicant,
                              e.target.value as Applicant["status"]
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold outline-none ${
                            applicant.status ===
                            "Hired"
                              ? "border-green-300 bg-green-50 text-green-700"
                              : applicant.status ===
                                "Rejected"
                              ? "border-red-300 bg-red-50 text-red-700"
                              : applicant.status ===
                                "Interview"
                              ? "border-blue-300 bg-blue-50 text-blue-700"
                              : applicant.status ===
                                "Shortlisted"
                              ? "border-purple-300 bg-purple-50 text-purple-700"
                              : applicant.status ===
                                "Screening"
                              ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                              : "border-slate-300 bg-slate-50 text-slate-700"
                          }`}
                        >
                          <option value="Applied">
                            Applied
                          </option>

                          <option value="Screening">
                            Screening
                          </option>

                          <option value="Shortlisted">
                            Shortlisted
                          </option>

                          <option value="Interview">
                            Interview
                          </option>

                          <option value="Rejected">
                            Rejected
                          </option>

                          <option value="Hired">
                            Hired
                          </option>
                        </select>

                      </div>

                      {/* APPLICANT DETAILS */}

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">

                        <p>
                          <strong>
                            Email:
                          </strong>{" "}
                          {
                            applicant.email
                          }
                        </p>

                        {applicant.phone && (
                          <p>
                            <strong>
                              Phone:
                            </strong>{" "}
                            {
                              applicant.phone
                            }
                          </p>
                        )}

                        {applicant.college && (
                          <p>
                            <strong>
                              College:
                            </strong>{" "}
                            {
                              applicant.college
                            }
                          </p>
                        )}

                        {applicant.state && (
                          <p>
                            <strong>
                              State:
                            </strong>{" "}
                            {
                              applicant.state
                            }
                          </p>
                        )}

                        {applicant.graduationYear && (
                          <p>
                            <strong>
                              Graduation:
                            </strong>{" "}
                            {
                              applicant.graduationYear
                            }
                          </p>
                        )}

                        <p>
                          <strong>
                            Job:
                          </strong>{" "}
                          {
                            applicant.job
                              ?.title ||
                            "Unknown job"
                          }
                        </p>

                      </div>

                      {/* SKILLS */}

                      {applicant.skills &&
                        applicant.skills.length >
                          0 && (
                          <div className="mt-4">

                            <p className="mb-2 text-sm font-semibold text-slate-700">
                              Skills
                            </p>

                            <div className="flex flex-wrap gap-2">

                              {applicant.skills.map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <span
                                    key={`${applicant._id}-skill-${index}`}
                                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                                  >
                                    {
                                      skill
                                    }
                                  </span>
                                )
                              )}

                            </div>

                          </div>
                        )}

                      {/* MATCH SCORE */}

                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              Candidate Match Score
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Based on applicant skills vs. job requirements.
                            </p>

                          </div>

                          <div className="text-right">

                            <p
                              className={`text-2xl font-bold ${
                                (applicant.matchScore ??
                                  0) >=
                                80
                                  ? "text-green-600"
                                  : (applicant.matchScore ??
                                      0) >=
                                    50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {
                                applicant.matchScore ??
                                0
                              }
                              %
                            </p>

                          </div>

                        </div>

                        {/* MATCHING SKILLS */}

                        {applicant.matchingSkills &&
                          applicant.matchingSkills.length >
                            0 && (
                            <div className="mt-4">

                              <p className="mb-2 text-xs font-semibold text-slate-600">
                                Matching Skills
                              </p>

                              <div className="flex flex-wrap gap-2">

                                {applicant.matchingSkills.map(
                                  (
                                    skill,
                                    index
                                  ) => (
                                    <span
                                      key={`matching-${applicant._id}-${index}`}
                                      className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                                    >
                                      ✓{" "}
                                      {
                                        skill
                                      }
                                    </span>
                                  )
                                )}

                              </div>

                            </div>
                          )}

                        {/* MISSING SKILLS */}

                        {applicant.missingSkills &&
                          applicant.missingSkills.length >
                            0 && (
                            <div className="mt-4">

                              <p className="mb-2 text-xs font-semibold text-slate-600">
                                Missing Skills
                              </p>

                              <div className="flex flex-wrap gap-2">

                                {applicant.missingSkills.map(
                                  (
                                    skill,
                                    index
                                  ) => (
                                    <span
                                      key={`missing-${applicant._id}-${index}`}
                                      className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                                    >
                                      ✗{" "}
                                      {
                                        skill
                                      }
                                    </span>
                                  )
                                )}

                              </div>

                            </div>
                          )}

                      </div>

                      {/* JOB EXPECTATION */}

                      {applicant.jobExpectation && (
                        <div className="mt-4 rounded-lg bg-slate-50 p-4">

                          <p className="text-sm font-semibold text-slate-700">
                            Job Expectation
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {
                              applicant.jobExpectation
                            }
                          </p>

                        </div>
                      )}

                      {/* RESUME */}

                      {applicant.resume && (
                        <a
                          href={
                            applicant.resume
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-block font-medium text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                      )}

                      {/* APPLIED DATE */}

                      <p className="mt-4 text-sm text-slate-400">
                        Applied:{" "}
                        {new Date(
                          applicant.appliedAt
                        ).toLocaleDateString()}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex h-fit flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleViewApplicant(
                            applicant._id
                          )
                        }
                        className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            applicant
                          )
                        }
                        className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            applicant._id
                          )
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Applicants;