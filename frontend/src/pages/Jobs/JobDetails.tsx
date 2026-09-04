import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

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

function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      if (!id) {
        setError("Job ID is missing.");
        return;
      }

      const response = await axios.get(
        `/api/jobs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJob(response.data.job);
    } catch (error) {
      console.error(
        "FETCH JOB DETAILS ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not load job details."
        );
      } else {
        setError("Could not load job details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading job details...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/jobs")}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Back to Jobs
        </button>

        <div className="rounded-2xl bg-white p-8 text-center text-red-600 shadow-sm">
          {error || "Job not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Job Details
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {job.title}
          </h1>

          <p className="mt-2 text-slate-600">
            {job.location} • {job.employmentType}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Jobs
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/jobs?edit=${job._id}`)
            }
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Edit Job
          </button>
        </div>
      </div>

      {/* Main Job Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              job.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {job.status}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {job.employmentType}
          </span>
        </div>

        {/* Job Information */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Location
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {job.location}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Employment Type
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {job.employmentType}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Salary
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {job.salary || "Not specified"}
            </p>
          </div>
        </div>

        {/* Description */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">
            Job Description
          </h2>

          <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-700">
            {job.description}
          </p>
        </section>

        {/* Skills */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">
            Required Skills
          </h2>

          {job.skills.length === 0 ? (
            <p className="mt-4 text-slate-500">
              No specific skills added.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {job.skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          )}
        </section>

        {/* Created Date */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-400">
            Created on{" "}
            {new Date(
              job.createdAt
            ).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Applicants Placeholder */}
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Applicants
            </h2>

            <p className="mt-2 text-slate-600">
              Applicants linked to this job will appear here.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/applicants?job=${job._id}`)
            }
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            View Applicants
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;