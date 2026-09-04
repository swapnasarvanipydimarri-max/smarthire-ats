import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Applicant {
  _id: string;
  name: string;
  email: string;
}

interface Job {
  _id: string;
  title: string;
}

type InterviewStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled"
  | "Rescheduled";

type InterviewType =
  | "Video"
  | "Phone"
  | "In-Person";

interface Interview {
  _id: string;
  scheduledAt: string;
  interviewType: InterviewType;
  interviewer?: string;
  status: InterviewStatus;
  applicant?: Applicant | string;
  job?: Job | string;
}

type CalendarFilter =
  | "All"
  | "Today"
  | "Tomorrow"
  | "This Week";

function Calendar() {
  const navigate = useNavigate();

  const [interviews, setInterviews] =
    useState<Interview[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [calendarFilter, setCalendarFilter] =
    useState<CalendarFilter>("All");

  const token =
    localStorage.getItem("token");

  // ==========================================
  // FETCH INTERVIEWS
  // ==========================================

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "/api/interviews",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInterviews(
        response.data.interviews || []
      );
    } catch (error) {
      console.error(
        "FETCH CALENDAR INTERVIEWS ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not load calendar."
        );
      } else {
        setError(
          "Could not load calendar."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // ==========================================
  // MONTH INFORMATION
  // ==========================================

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const monthName =
    currentDate.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

  const firstDayOfMonth =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  // ==========================================
  // CALENDAR DAYS
  // ==========================================

  const calendarDays = useMemo(() => {
    const days: (
      | number
      | null
    )[] = [];

    for (
      let i = 0;
      i < firstDayOfMonth;
      i++
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(day);
    }

    return days;
  }, [
    firstDayOfMonth,
    daysInMonth,
  ]);

  // ==========================================
  // UPCOMING INTERVIEWS
  // ==========================================

  const upcomingInterviews =
    useMemo(() => {
      const now = new Date();

      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const startOfTomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      const endOfTomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 2
      );

      // Sunday = 0
      const dayOfWeek =
        startOfToday.getDay();

      const startOfWeek = new Date(
        startOfToday
      );

      startOfWeek.setDate(
        startOfToday.getDate() -
          dayOfWeek
      );

      const endOfWeek = new Date(
        startOfWeek
      );

      endOfWeek.setDate(
        startOfWeek.getDate() + 7
      );

      return interviews
        .filter((interview) => {
          const interviewDate =
            new Date(
              interview.scheduledAt
            );

          // Hide cancelled interviews
          if (
            interview.status ===
            "Cancelled"
          ) {
            return false;
          }

          // Only upcoming interviews
          if (
            interviewDate < now
          ) {
            return false;
          }

          // ==================================
          // FILTER
          // ==================================

          switch (calendarFilter) {
            case "Today":
              return (
                interviewDate >=
                  startOfToday &&
                interviewDate <
                  endOfToday
              );

            case "Tomorrow":
              return (
                interviewDate >=
                  startOfTomorrow &&
                interviewDate <
                  endOfTomorrow
              );

            case "This Week":
              return (
                interviewDate >=
                  startOfWeek &&
                interviewDate <
                  endOfWeek
              );

            case "All":
            default:
              return true;
          }
        })
        .sort(
          (a, b) =>
            new Date(
              a.scheduledAt
            ).getTime() -
            new Date(
              b.scheduledAt
            ).getTime()
        )
        .slice(0, 10);
    }, [
      interviews,
      calendarFilter,
    ]);

  // ==========================================
  // GET APPLICANT
  // ==========================================

  const getApplicant = (
    interview: Interview
  ): Applicant | null => {
    if (
      interview.applicant &&
      typeof interview.applicant !==
        "string"
    ) {
      return interview.applicant;
    }

    return null;
  };

  // ==========================================
  // GET JOB
  // ==========================================

  const getJob = (
    interview: Interview
  ): Job | null => {
    if (
      interview.job &&
      typeof interview.job !==
        "string"
    ) {
      return interview.job;
    }

    return null;
  };

  // ==========================================
  // GET DAY INTERVIEWS
  // ==========================================

  const getInterviewsForDay = (
    day: number
  ) => {
    return interviews.filter(
      (interview) => {
        const date = new Date(
          interview.scheduledAt
        );

        return (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() === day
        );
      }
    );
  };

  // ==========================================
  // PREVIOUS MONTH
  // ==========================================

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(
        year,
        month - 1,
        1
      )
    );
  };

  // ==========================================
  // NEXT MONTH
  // ==========================================

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(
        year,
        month + 1,
        1
      )
    );
  };

  // ==========================================
  // TODAY
  // ==========================================

  const handleToday = () => {
    setCurrentDate(
      new Date()
    );
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusClasses = (
    status: InterviewStatus
  ) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      case "Rescheduled":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ==========================================
  // FILTER BUTTON STYLE
  // ==========================================

  const getFilterButtonClasses = (
    filter: CalendarFilter
  ) => {
    return calendarFilter === filter
      ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div>
        <p className="text-sm font-medium text-slate-500">
          Recruitment Management
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Interview Calendar
        </h1>

        <p className="mt-2 text-slate-600">
          View all interviews by date and see your upcoming schedule.
        </p>
      </div>

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* ====================================== */}
      {/* CALENDAR CONTROLS */}
      {/* ====================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <h2 className="text-2xl font-bold text-slate-900">
            {monthName}
          </h2>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={
                handlePreviousMonth
              }
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={handleToday}
              className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
            >
              Today
            </button>

            <button
              type="button"
              onClick={
                handleNextMonth
              }
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Next →
            </button>

          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* CALENDAR */}
      {/* ====================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* WEEKDAYS */}

        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">

          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div
              key={day}
              className="border-r border-slate-200 p-3 text-center text-sm font-bold text-slate-600 last:border-r-0"
            >
              {day}
            </div>
          ))}

        </div>

        {/* DAYS */}

        <div className="grid grid-cols-7">

          {calendarDays.map(
            (day, index) => {
              const dayInterviews =
                day !== null
                  ? getInterviewsForDay(
                      day
                    )
                  : [];

              const today =
                new Date();

              const isToday =
                day !== null &&
                today.getFullYear() ===
                  year &&
                today.getMonth() ===
                  month &&
                today.getDate() ===
                  day;

              return (
                <div
                  key={`day-${index}`}
                  className="min-h-[160px] border-b border-r border-slate-200 p-2"
                >

                  {day !== null && (
                    <>
                      {/* DAY NUMBER */}

                      <div className="mb-2 flex items-center justify-between">

                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            isToday
                              ? "bg-slate-900 text-white"
                              : "text-slate-700"
                          }`}
                        >
                          {day}
                        </span>

                        {dayInterviews.length >
                          0 && (
                          <span className="text-xs font-semibold text-slate-400">
                            {
                              dayInterviews.length
                            }
                          </span>
                        )}

                      </div>

                      {/* INTERVIEWS */}

                      <div className="space-y-2">

                        {dayInterviews.map(
                          (interview) => {
                            const applicant =
                              getApplicant(
                                interview
                              );

                            const job =
                              getJob(
                                interview
                              );

                            const interviewTime =
                              new Date(
                                interview.scheduledAt
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              );

                            return (
                              <button
                                key={
                                  interview._id
                                }
                                type="button"
                                onClick={() => {
                                  if (
                                    applicant?._id
                                  ) {
                                    navigate(
                                      `/applicants/${applicant._id}`
                                    );
                                  }
                                }}
                                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:bg-slate-50"
                              >
                                <p className="truncate text-xs font-bold text-slate-900">
                                  {interviewTime}
                                </p>

                                <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                                  {applicant?.name ||
                                    "Unknown Applicant"}
                                </p>

                                <p className="mt-1 truncate text-[11px] text-slate-500">
                                  {job?.title ||
                                    "Unknown Job"}
                                </p>

                                <span
                                  className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                                    interview.status
                                  )}`}
                                >
                                  {
                                    interview.status
                                  }
                                </span>
                              </button>
                            );
                          }
                        )}

                      </div>
                    </>
                  )}

                </div>
              );
            }
          )}

        </div>
      </div>

      {/* ====================================== */}
      {/* UPCOMING INTERVIEWS */}
      {/* ====================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex flex-col gap-4">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Upcoming Interviews
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Filter and view your upcoming interview schedule.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/interviews")
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage Interviews
            </button>

          </div>

          {/* ================================== */}
          {/* FILTERS */}
          {/* ================================== */}

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                setCalendarFilter("All")
              }
              className={getFilterButtonClasses(
                "All"
              )}
            >
              All
            </button>

            <button
              type="button"
              onClick={() =>
                setCalendarFilter("Today")
              }
              className={getFilterButtonClasses(
                "Today"
              )}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() =>
                setCalendarFilter("Tomorrow")
              }
              className={getFilterButtonClasses(
                "Tomorrow"
              )}
            >
              Tomorrow
            </button>

            <button
              type="button"
              onClick={() =>
                setCalendarFilter("This Week")
              }
              className={getFilterButtonClasses(
                "This Week"
              )}
            >
              This Week
            </button>

          </div>

        </div>

        {/* ================================== */}
        {/* INTERVIEW LIST */}
        {/* ================================== */}

        {upcomingInterviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

            <p className="text-slate-600">
              No upcoming interviews found for{" "}
              <span className="font-semibold">
                {calendarFilter}
              </span>
              .
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Schedule an interview from an applicant's profile.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {upcomingInterviews.map(
              (interview) => {
                const applicant =
                  getApplicant(
                    interview
                  );

                const job =
                  getJob(interview);

                return (
                  <div
                    key={interview._id}
                    className="rounded-xl border border-slate-200 p-5"
                  >

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                      <div>

                        <h3 className="text-lg font-bold text-slate-900">
                          {applicant?.name ||
                            "Unknown Applicant"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {job?.title ||
                            "Unknown Job"}
                        </p>

                      </div>

                      <div className="text-sm font-semibold text-slate-700">
                        {new Date(
                          interview.scheduledAt
                        ).toLocaleString()}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            interview.status
                          )}`}
                        >
                          {interview.status}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {interview.interviewType}
                        </span>

                      </div>

                      {applicant?._id && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/applicants/${applicant._id}`
                            )
                          }
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          View Applicant
                        </button>
                      )}

                    </div>

                    {interview.interviewer && (
                      <p className="mt-3 text-sm text-slate-500">
                        Interviewer:{" "}
                        <span className="font-semibold text-slate-700">
                          {interview.interviewer}
                        </span>
                      </p>
                    )}

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Calendar;