import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type ApplicantStatus =
  | "Applied"
  | "Screening"
  | "Shortlisted"
  | "Interview"
  | "Rejected"
  | "Hired";

interface Job {
  _id: string;
  title: string;
}

interface Applicant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  job?: Job | null;
  status: ApplicantStatus;
  resume?: string;
}

const pipelineStatuses: ApplicantStatus[] = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Hired",
];

function Pipeline() {
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/api/applicants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplicants(response.data.applicants || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load recruitment pipeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const jobs = useMemo(() => {
    const jobMap = new Map<string, Job>();

    applicants.forEach((applicant) => {
      if (applicant.job?._id) {
        jobMap.set(applicant.job._id, applicant.job);
      }
    });

    return Array.from(jobMap.values());
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    if (!selectedJobId) {
      return applicants;
    }

    return applicants.filter(
      (applicant) => applicant.job?._id === selectedJobId
    );
  }, [applicants, selectedJobId]);

  const getApplicantsByStatus = (status: ApplicantStatus) => {
    return filteredApplicants.filter(
      (applicant) => applicant.status === status
    );
  };

  const handleStatusUpdate = async (
    applicantId: string,
    newStatus: ApplicantStatus
  ) => {
    try {
      await axios.put(
        `/api/applicants/${applicantId}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplicants((current) =>
        current.map((applicant) =>
          applicant._id === applicantId
            ? { ...applicant, status: newStatus }
            : applicant
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update applicant status.");
    }
  };

  const handleViewApplicant = (id: string) => {
    navigate(`/applicants/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Loading recruitment pipeline...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Recruitment Pipeline
        </h1>

        <p className="mt-1 text-slate-600">
          Track applicants through every recruitment stage.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Job Filter */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Filter by Job
        </label>

        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
        >
          <option value="">All Jobs</option>

          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {pipelineStatuses.map((status) => {
          const count = getApplicantsByStatus(status).length;

          return (
            <div
              key={status}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{status}</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Columns */}
      <div className="grid gap-5 xl:grid-cols-5">
        {pipelineStatuses.map((status) => {
          const stageApplicants = getApplicantsByStatus(status);

          return (
            <div
              key={status}
              className="min-h-[500px] rounded-xl border border-slate-200 bg-slate-100 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">{status}</h2>

                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                  {stageApplicants.length}
                </span>
              </div>

              <div className="space-y-4">
                {stageApplicants.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                    No applicants
                  </div>
                ) : (
                  stageApplicants.map((applicant) => (
                    <div
                      key={applicant._id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-3">
                        <h3 className="font-bold text-slate-900">
                          {applicant.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {applicant.job?.title || "No job assigned"}
                        </p>
                      </div>

                      <div className="space-y-1 text-sm text-slate-600">
                        <p>{applicant.email}</p>

                        {applicant.phone && <p>{applicant.phone}</p>}

                        {applicant.college && <p>{applicant.college}</p>}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewApplicant(applicant._id)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </button>

                        {applicant.resume && (
                          <a
                            href={applicant.resume}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Resume
                          </a>
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Change Stage
                        </label>

                        <select
                          value={applicant.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              applicant._id,
                              e.target.value as ApplicantStatus
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Screening">Screening</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Hired">Hired</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejected Applicants */}
      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-red-800">
            Rejected Applicants
          </h2>

          <p className="text-sm text-red-700">
            Applicants who were moved to the rejected stage.
          </p>
        </div>

        {getApplicantsByStatus("Rejected").length === 0 ? (
          <p className="text-sm text-red-700">No rejected applicants.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {getApplicantsByStatus("Rejected").map((applicant) => (
              <div
                key={applicant._id}
                className="rounded-xl border border-red-200 bg-white p-4"
              >
                <h3 className="font-bold text-slate-900">
                  {applicant.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {applicant.job?.title || "No job assigned"}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {applicant.email}
                </p>

                <button
                  type="button"
                  onClick={() => handleViewApplicant(applicant._id)}
                  className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Applicant
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Pipeline;