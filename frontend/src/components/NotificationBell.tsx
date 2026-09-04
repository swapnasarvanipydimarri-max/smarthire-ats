import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Applicant {
  _id: string;
  name: string;
  email?: string;
}

interface Job {
  _id: string;
  title: string;
}

interface Notification {
  _id: string;
  type: string;
  priority: "High" | "Medium" | "Low";
  message: string;
  scheduledAt: string;
  applicant?: Applicant | string;
  job?: Job | string;
  interviewType?: "Video" | "Phone" | "In-Person";
  interviewer?: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";
}

function NotificationBell() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const dropdownRef =
    useRef<HTMLDivElement | null>(null);

  const token =
    localStorage.getItem("token");

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        return;
      }

      const response = await axios.get(
        "/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(
        response.data.notifications || []
      );
    } catch (error) {
      console.error(
        "FETCH NOTIFICATIONS ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not load notifications."
        );
      } else {
        setError(
          "Could not load notifications."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==========================================
  // REFRESH EVERY 60 SECONDS
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // CLOSE DROPDOWN OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================================
  // GET APPLICANT
  // ==========================================

  const getApplicant = (
    notification: Notification
  ): Applicant | null => {
    if (
      notification.applicant &&
      typeof notification.applicant !==
        "string"
    ) {
      return notification.applicant;
    }

    return null;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    scheduledAt: string
  ) => {
    return new Date(
      scheduledAt
    ).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // PRIORITY STYLE
  // ==========================================

  const getPriorityClasses = (
    priority: Notification["priority"]
  ) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";

      case "Medium":
        return "bg-yellow-100 text-yellow-700";

      case "Low":
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ==========================================
  // NOTIFICATION CLICK
  // ==========================================

  const handleNotificationClick = (
    notification: Notification
  ) => {
    const applicant =
      getApplicant(notification);

    setOpen(false);

    if (applicant?._id) {
      navigate(
        `/applicants/${applicant._id}`
      );
    } else {
      navigate("/interviews");
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >

      {/* ====================================== */}
      {/* BELL BUTTON */}
      {/* ====================================== */}

      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        aria-label="Notifications"
      >

        {/* Bell Icon */}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 1-5.714 0A2.985 2.985 0 0 1 6.5 14.1V11a5.5 5.5 0 0 1 11 0v3.1a2.985 2.985 0 0 1-2.643 2.982ZM9.75 19.5h4.5"
          />
        </svg>

        {/* Notification Count */}

        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {notifications.length > 9
              ? "9+"
              : notifications.length}
          </span>
        )}

      </button>

      {/* ====================================== */}
      {/* DROPDOWN */}
      {/* ====================================== */}

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

            <div>
              <h3 className="font-bold text-slate-900">
                Notifications
              </h3>

              <p className="text-xs text-slate-500">
                Upcoming interview reminders
              </p>
            </div>

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* NOTIFICATIONS */}

          <div className="max-h-[420px] overflow-y-auto">

            {loading &&
            notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="px-4 py-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 1-5.714 0A2.985 2.985 0 0 1 6.5 14.1V11a5.5 5.5 0 0 1 11 0v3.1a2.985 2.985 0 0 1-2.643 2.982ZM9.75 19.5h4.5"
                    />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No upcoming interviews
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  You are all caught up.
                </p>

              </div>
            ) : (
              <div>
                {notifications.map(
                  (notification) => {
                    const applicant =
                      getApplicant(
                        notification
                      );

                    return (
                      <button
                        key={
                          notification._id
                        }
                        type="button"
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className="w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 last:border-b-0"
                      >

                        <div className="flex items-start gap-3">

                          {/* ICON */}

                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.8}
                              stroke="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 3.75h10.5A2.25 2.25 0 0 1 19.5 6v12a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18V6a2.25 2.25 0 0 1 2.25-2.25Z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 8.25h7.5M8.25 12h7.5M8.25 15.75h4.5"
                              />
                            </svg>

                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-2">

                              <p className="truncate text-sm font-bold text-slate-900">
                                {applicant?.name ||
                                  "Upcoming Interview"}
                              </p>

                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${getPriorityClasses(
                                  notification.priority
                                )}`}
                              >
                                {
                                  notification.priority
                                }
                              </span>

                            </div>

                            <p className="mt-1 text-xs text-slate-600">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-xs font-semibold text-slate-700">
                              {formatDate(
                                notification.scheduledAt
                              )}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">

                              {notification.interviewType && (
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                                  {
                                    notification.interviewType
                                  }
                                </span>
                              )}

                              {notification.status && (
                                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                                  {
                                    notification.status
                                  }
                                </span>
                              )}

                            </div>

                          </div>

                        </div>

                      </button>
                    );
                  }
                )}
              </div>
            )}

          </div>

          {/* FOOTER */}

          <div className="border-t border-slate-200 bg-slate-50 p-3">

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/interviews");
              }}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View All Interviews
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationBell;