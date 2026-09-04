import { useEffect, useState } from "react";
import axios from "axios";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  appliedApplicants: number;
  screeningApplicants: number;
  shortlistedApplicants: number;
  interviewApplicants: number;
  rejectedApplicants: number;
  hiredApplicants: number;
  hiringRate: number;
  rejectionRate: number;
  interviewRate: number;
  shortlistRate: number;
}

interface Job {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  status: string;
  createdAt: string;
}

interface Applicant {
  _id: string;
  name: string;
  email: string;
  status: string;
  appliedAt: string;
  job?: {
    title: string;
  };
}

interface FunnelItem {
  status: string;
  count: number;
}

interface ApplicantPerJob {
  jobId: string;
  jobTitle: string;
  applicantCount: number;
}

interface DashboardResponse {
  stats: DashboardStats;
  recruitmentFunnel: FunnelItem[];
  applicantsPerJob: ApplicantPerJob[];
  recentJobs: Job[];
  recentApplicants: Applicant[];
}

function Dashboard() {
  const [stats, setStats] =
    useState<DashboardStats>({
      totalJobs: 0,
      activeJobs: 0,
      totalApplicants: 0,
      appliedApplicants: 0,
      screeningApplicants: 0,
      shortlistedApplicants: 0,
      interviewApplicants: 0,
      rejectedApplicants: 0,
      hiredApplicants: 0,
      hiringRate: 0,
      rejectionRate: 0,
      interviewRate: 0,
      shortlistRate: 0,
    });

  const [recruitmentFunnel, setRecruitmentFunnel] =
    useState<FunnelItem[]>([]);

  const [applicantsPerJob, setApplicantsPerJob] =
    useState<ApplicantPerJob[]>([]);

  const [recentJobs, setRecentJobs] =
    useState<Job[]>([]);

  const [recentApplicants, setRecentApplicants] =
    useState<Applicant[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }

        const response =
          await axios.get<DashboardResponse>(
            "/api/dashboard/stats",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setStats(response.data.stats);

        setRecruitmentFunnel(
          response.data.recruitmentFunnel || []
        );

        setApplicantsPerJob(
          response.data.applicantsPerJob || []
        );

        setRecentJobs(
          response.data.recentJobs || []
        );

        setRecentApplicants(
          response.data.recentApplicants || []
        );
      } catch (error) {
        console.error(
          "FETCH DASHBOARD ERROR:",
          error
        );

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Could not load dashboard."
          );
        } else {
          setError("Could not load dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const statistics = [
    {
      title: "Total Jobs",
      value: stats.totalJobs,
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
    },
    {
      title: "Total Applicants",
      value: stats.totalApplicants,
    },
    {
      title: "Shortlisted",
      value: stats.shortlistedApplicants,
    },
    {
      title: "Interviews",
      value: stats.interviewApplicants,
    },
    {
      title: "Hired",
      value: stats.hiredApplicants,
    },
  ];

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-700";

      case "Screening":
        return "bg-purple-100 text-purple-700";

      case "Shortlisted":
        return "bg-yellow-100 text-yellow-700";

      case "Interview":
        return "bg-orange-100 text-orange-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Hired":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getFunnelWidth = (count: number) => {
    const maxCount = Math.max(
      ...recruitmentFunnel.map(
        (item) => item.count
      ),
      1
    );

    return `${Math.max(
      (count / maxCount) * 100,
      count > 0 ? 8 : 0
    )}%`;
  };

  const getJobBarWidth = (count: number) => {
    const maxCount = Math.max(
      ...applicantsPerJob.map(
        (item) => item.applicantCount
      ),
      1
    );

    return `${Math.max(
      (count / maxCount) * 100,
      count > 0 ? 8 : 0
    )}%`;
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-600">
          Welcome back to SmartHire.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statistics.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.title}
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recruitment Performance */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Recruitment Performance
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Hiring Rate */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Hiring Rate
            </p>

            <p className="mt-3 text-3xl font-bold text-green-600">
              {stats.hiringRate}%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Percentage of applicants hired
            </p>
          </div>

          {/* Rejection Rate */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Rejection Rate
            </p>

            <p className="mt-3 text-3xl font-bold text-red-600">
              {stats.rejectionRate}%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Percentage of applicants rejected
            </p>
          </div>

          {/* Interview Rate */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Interview Rate
            </p>

            <p className="mt-3 text-3xl font-bold text-orange-600">
              {stats.interviewRate}%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Applicants reaching interviews
            </p>
          </div>

          {/* Shortlist Rate */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Shortlist Rate
            </p>

            <p className="mt-3 text-3xl font-bold text-yellow-600">
              {stats.shortlistRate}%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Applicants shortlisted
            </p>
          </div>
        </div>
      </div>

      {/* Recruitment Funnel + Applicants per Job */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recruitment Funnel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Recruitment Funnel
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Applicant movement through recruitment stages.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {recruitmentFunnel.length === 0 ? (
              <p className="text-slate-500">
                No recruitment data available.
              </p>
            ) : (
              recruitmentFunnel.map((item) => (
                <div key={item.status}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      {item.status}
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                      {item.count}
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${getStatusClasses(
                        item.status
                      )}`}
                      style={{
                        width:
                          getFunnelWidth(
                            item.count
                          ),
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Applicants Per Job */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Applicants by Job
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Jobs receiving the most applications.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {applicantsPerJob.length === 0 ? (
              <p className="text-slate-500">
                No applicant data available.
              </p>
            ) : (
              applicantsPerJob
                .slice(0, 5)
                .map((job) => (
                  <div key={job.jobId}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-slate-700">
                        {job.jobTitle}
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {job.applicantCount}
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-700"
                        style={{
                          width:
                            getJobBarWidth(
                              job.applicantCount
                            ),
                        }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Jobs + Applicants */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Jobs
            </h2>

            <span className="text-sm text-slate-500">
              {recentJobs.length}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {recentJobs.length === 0 ? (
              <p className="text-slate-500">
                No jobs created yet.
              </p>
            ) : (
              recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-lg border border-slate-100 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">
                      {job.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        job.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {job.location} •{" "}
                    {job.employmentType}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Created{" "}
                    {new Date(
                      job.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Applicants
            </h2>

            <span className="text-sm text-slate-500">
              {recentApplicants.length}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {recentApplicants.length === 0 ? (
              <p className="text-slate-500">
                No applicants yet.
              </p>
            ) : (
              recentApplicants.map(
                (applicant) => (
                  <div
                    key={applicant._id}
                    className="rounded-lg border border-slate-100 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">
                        {applicant.name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                          applicant.status
                        )}`}
                      >
                        {applicant.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {applicant.email}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Job:{" "}
                      {applicant.job?.title ||
                        "Unknown job"}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Applied{" "}
                      {new Date(
                        applicant.appliedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* Recruitment Overview */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Recruitment Overview
        </h2>

        <p className="mt-2 text-slate-600">
          SmartHire is tracking{" "}
          <span className="font-semibold text-slate-900">
            {stats.totalApplicants}
          </span>{" "}
          applicants across{" "}
          <span className="font-semibold text-slate-900">
            {stats.totalJobs}
          </span>{" "}
          jobs.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Applied
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.appliedApplicants}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Screening
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.screeningApplicants}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Rejected
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.rejectedApplicants}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Hired
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.hiredApplicants}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;