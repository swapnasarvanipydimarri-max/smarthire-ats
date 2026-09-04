import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Applicant {
  _id: string;
  name: string;
  email: string;
  status: string;
}

interface Job {
  _id: string;
  title: string;
  location?: string;
  employmentType?: string;
}

type InterviewType =
  | "Video"
  | "Phone"
  | "In-Person";

type InterviewStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled"
  | "Rescheduled";

interface Interview {
  _id: string;
  scheduledAt: string;
  interviewType: InterviewType;
  interviewer?: string;
  status: InterviewStatus;
  feedback?: string;
  notes?: string;
  applicant?: Applicant | string;
  job?: Job | string;
}

function Interviews() {
  const navigate = useNavigate();

  const [interviews, setInterviews] =
    useState<Interview[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | InterviewStatus>("All");

  // ==========================================
  // FULL INTERVIEW EDIT STATE
  // ==========================================

  const [editingInterviewId, setEditingInterviewId] =
    useState<string | null>(null);

  const [editScheduledAt, setEditScheduledAt] =
    useState("");

  const [editInterviewType, setEditInterviewType] =
    useState<InterviewType>("Video");

  const [editInterviewer, setEditInterviewer] =
    useState("");

  const [editStatus, setEditStatus] =
    useState<InterviewStatus>("Scheduled");

  const [editNotes, setEditNotes] =
    useState("");

  const [editFeedback, setEditFeedback] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  // ==========================================
  // NOTES EDIT STATE
  // ==========================================

  const [editingNotesId, setEditingNotesId] =
    useState<string | null>(null);

  const [notesText, setNotesText] =
    useState("");

  const [savingNotes, setSavingNotes] =
    useState(false);

  // ==========================================
  // FEEDBACK EDIT STATE
  // ==========================================

  const [editingFeedbackId, setEditingFeedbackId] =
    useState<string | null>(null);

  const [feedbackText, setFeedbackText] =
    useState("");

  const [savingFeedback, setSavingFeedback] =
    useState(false);

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
        "FETCH INTERVIEWS ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not load interviews."
        );
      } else {
        setError(
          "Could not load interviews."
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
  // FILTER
  // ==========================================

  const filteredInterviews = useMemo(() => {
    if (statusFilter === "All") {
      return interviews;
    }

    return interviews.filter(
      (interview) =>
        interview.status === statusFilter
    );
  }, [interviews, statusFilter]);

  // ==========================================
  // COUNTS
  // ==========================================

  const counts = useMemo(() => {
    return {
      total: interviews.length,

      scheduled: interviews.filter(
        (interview) =>
          interview.status === "Scheduled"
      ).length,

      completed: interviews.filter(
        (interview) =>
          interview.status === "Completed"
      ).length,

      cancelled: interviews.filter(
        (interview) =>
          interview.status === "Cancelled"
      ).length,

      rescheduled: interviews.filter(
        (interview) =>
          interview.status === "Rescheduled"
      ).length,
    };
  }, [interviews]);

  // ==========================================
  // GET APPLICANT
  // ==========================================

  const getApplicant = (
    interview: Interview
  ): Applicant | null => {
    if (
      interview.applicant &&
      typeof interview.applicant !== "string"
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
      typeof interview.job !== "string"
    ) {
      return interview.job;
    }

    return null;
  };

  // ==========================================
  // START FULL INTERVIEW EDIT
  // ==========================================

  const handleStartEdit = (
    interview: Interview
  ) => {
    setEditingInterviewId(
      interview._id
    );

    setEditInterviewType(
      interview.interviewType
    );

    setEditInterviewer(
      interview.interviewer || ""
    );

    setEditStatus(
      interview.status
    );

    setEditNotes(
      interview.notes || ""
    );

    setEditFeedback(
      interview.feedback || ""
    );

    const date = new Date(
      interview.scheduledAt
    );

    const localDate =
      new Date(
        date.getTime() -
          date.getTimezoneOffset() *
            60000
      )
        .toISOString()
        .slice(0, 16);

    setEditScheduledAt(
      localDate
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CANCEL FULL INTERVIEW EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingInterviewId(null);

    setEditScheduledAt("");
    setEditInterviewType("Video");
    setEditInterviewer("");
    setEditStatus("Scheduled");
    setEditNotes("");
    setEditFeedback("");
  };

  // ==========================================
  // SAVE FULL INTERVIEW EDIT
  // ==========================================

  const handleSaveEdit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!editingInterviewId) {
      return;
    }

    if (!editScheduledAt) {
      alert(
        "Please select an interview date and time."
      );
      return;
    }

    try {
      setSavingEdit(true);

      const response = await axios.put(
        `/api/interviews/${editingInterviewId}`,
        {
          scheduledAt:
            editScheduledAt,
          interviewType:
            editInterviewType,
          interviewer:
            editInterviewer,
          status:
            editStatus,
          notes:
            editNotes,
          feedback:
            editFeedback,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const updatedInterview =
        response.data.interview;

      setInterviews((current) =>
        current.map((interview) =>
          interview._id ===
          editingInterviewId
            ? updatedInterview
            : interview
        )
      );

      handleCancelEdit();

      alert(
        "Interview updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE INTERVIEW ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to update interview."
        );
      } else {
        alert(
          "Failed to update interview."
        );
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // ==========================================
  // QUICK STATUS UPDATE
  // ==========================================

  const handleStatusUpdate = async (
    interviewId: string,
    newStatus: InterviewStatus
  ) => {
    try {
      const response = await axios.put(
        `/api/interviews/${interviewId}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const updatedInterview =
        response.data.interview;

      setInterviews((current) =>
        current.map((interview) =>
          interview._id === interviewId
            ? updatedInterview
            : interview
        )
      );
    } catch (error) {
      console.error(
        "UPDATE INTERVIEW STATUS ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to update interview status."
        );
      } else {
        alert(
          "Failed to update interview status."
        );
      }
    }
  };

  // ==========================================
  // START EDIT NOTES
  // ==========================================

  const handleEditNotes = (
    interview: Interview
  ) => {
    setEditingNotesId(
      interview._id
    );

    setNotesText(
      interview.notes || ""
    );
  };

  // ==========================================
  // SAVE NOTES
  // ==========================================

  const handleSaveNotes = async (
    interviewId: string
  ) => {
    try {
      setSavingNotes(true);

      const response = await axios.put(
        `/api/interviews/${interviewId}`,
        {
          notes: notesText,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const updatedInterview =
        response.data.interview;

      setInterviews((current) =>
        current.map((interview) =>
          interview._id === interviewId
            ? updatedInterview
            : interview
        )
      );

      setEditingNotesId(null);
      setNotesText("");
    } catch (error) {
      console.error(
        "UPDATE INTERVIEW NOTES ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to update interview notes."
        );
      } else {
        alert(
          "Failed to update interview notes."
        );
      }
    } finally {
      setSavingNotes(false);
    }
  };

  // ==========================================
  // DELETE NOTES
  // ==========================================

  const handleDeleteNotes = async (
    interviewId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete the interview notes?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.put(
        `/api/interviews/${interviewId}`,
        {
          notes: "",
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const updatedInterview =
        response.data.interview;

      setInterviews((current) =>
        current.map((interview) =>
          interview._id === interviewId
            ? updatedInterview
            : interview
        )
      );

      if (
        editingNotesId ===
        interviewId
      ) {
        setEditingNotesId(null);
        setNotesText("");
      }
    } catch (error) {
      console.error(
        "DELETE INTERVIEW NOTES ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to delete interview notes."
        );
      } else {
        alert(
          "Failed to delete interview notes."
        );
      }
    }
  };

  // ==========================================
  // START EDIT FEEDBACK
  // ==========================================

  const handleEditFeedback = (
    interview: Interview
  ) => {
    setEditingFeedbackId(
      interview._id
    );

    setFeedbackText(
      interview.feedback || ""
    );
  };

  // ==========================================
  // SAVE FEEDBACK
  // ==========================================

  const handleSaveFeedback = async (
    interviewId: string
  ) => {
    try {
      setSavingFeedback(true);

      const response = await axios.put(
        `/api/interviews/${interviewId}`,
        {
          feedback: feedbackText,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const updatedInterview =
        response.data.interview;

      setInterviews((current) =>
        current.map((interview) =>
          interview._id === interviewId
            ? updatedInterview
            : interview
        )
      );

      setEditingFeedbackId(null);
      setFeedbackText("");
    } catch (error) {
      console.error(
        "UPDATE INTERVIEW FEEDBACK ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to update interview feedback."
        );
      } else {
        alert(
          "Failed to update interview feedback."
        );
      }
    } finally {
      setSavingFeedback(false);
    }
  };

  // ==========================================
  // DELETE FEEDBACK
  // ==========================================

  const handleDeleteFeedback = async (
    interviewId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete the interview feedback?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.put(
        `/api/interviews/${interviewId}`,
        {
          feedback: "",
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const updatedInterview =
        response.data.interview;

      setInterviews((current) =>
        current.map((interview) =>
          interview._id === interviewId
            ? updatedInterview
            : interview
        )
      );

      if (
        editingFeedbackId ===
        interviewId
      ) {
        setEditingFeedbackId(null);
        setFeedbackText("");
      }
    } catch (error) {
      console.error(
        "DELETE INTERVIEW FEEDBACK ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to delete interview feedback."
        );
      } else {
        alert(
          "Failed to delete interview feedback."
        );
      }
    }
  };

  // ==========================================
  // DELETE INTERVIEW
  // ==========================================

  const handleDelete = async (
    interviewId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this interview?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `/api/interviews/${interviewId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setInterviews((current) =>
        current.filter(
          (interview) =>
            interview._id !==
            interviewId
        )
      );

      if (
        editingInterviewId ===
        interviewId
      ) {
        handleCancelEdit();
      }

      if (
        editingNotesId ===
        interviewId
      ) {
        setEditingNotesId(null);
        setNotesText("");
      }

      if (
        editingFeedbackId ===
        interviewId
      ) {
        setEditingFeedbackId(null);
        setFeedbackText("");
      }
    } catch (error) {
      console.error(
        "DELETE INTERVIEW ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to delete interview."
        );
      } else {
        alert(
          "Failed to delete interview."
        );
      }
    }
  };

  // ==========================================
  // STATUS STYLES
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
  // TYPE STYLES
  // ==========================================

  const getInterviewTypeClasses = (
    type: InterviewType
  ) => {
    switch (type) {
      case "Video":
        return "bg-purple-100 text-purple-700";

      case "Phone":
        return "bg-cyan-100 text-cyan-700";

      case "In-Person":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading interviews...
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

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
          Interviews
        </h1>

        <p className="mt-2 text-slate-600">
          Schedule, manage, and review candidate interviews.
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
      {/* SUMMARY CARDS */}
      {/* ====================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Interviews
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {counts.total}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-700">
            Scheduled
          </p>

          <p className="mt-3 text-3xl font-bold text-blue-700">
            {counts.scheduled}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-green-700">
            Completed
          </p>

          <p className="mt-3 text-3xl font-bold text-green-700">
            {counts.completed}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-red-700">
            Cancelled
          </p>

          <p className="mt-3 text-3xl font-bold text-red-700">
            {counts.cancelled}
          </p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-yellow-700">
            Rescheduled
          </p>

          <p className="mt-3 text-3xl font-bold text-yellow-700">
            {counts.rescheduled}
          </p>
        </div>

      </div>

      {/* ====================================== */}
      {/* FILTER */}
      {/* ====================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Filter by Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "All"
                    | InterviewStatus
                )
              }
              className="w-full min-w-64 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="All">
                All Interviews
              </option>

              <option value="Scheduled">
                Scheduled
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

              <option value="Rescheduled">
                Rescheduled
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchInterviews}
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh Interviews
          </button>

        </div>
      </div>

      {/* ====================================== */}
      {/* INTERVIEW LIST */}
      {/* ====================================== */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Interview Schedule
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredInterviews.length} interview
            {filteredInterviews.length === 1
              ? ""
              : "s"} shown
          </p>
        </div>

        {filteredInterviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

            <h3 className="text-lg font-semibold text-slate-700">
              No interviews found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Schedule an interview from an applicant's profile.
            </p>

          </div>
        ) : (
          <div className="space-y-6">

            {filteredInterviews.map(
              (interview) => {
                const applicant =
                  getApplicant(interview);

                const job =
                  getJob(interview);

                const isEditing =
                  editingInterviewId ===
                  interview._id;

                const isEditingNotes =
                  editingNotesId ===
                  interview._id;

                const isEditingFeedback =
                  editingFeedbackId ===
                  interview._id;

                return (
                  <div
                    key={interview._id}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >

                    {/* ================================= */}
                    {/* FULL INTERVIEW EDIT MODE */}
                    {/* ================================= */}

                    {isEditing ? (
                      <form
                        onSubmit={
                          handleSaveEdit
                        }
                      >

                        <div className="mb-6">

                          <h3 className="text-xl font-bold text-slate-900">
                            Edit Interview
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Update schedule, status, notes, and feedback.
                          </p>

                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                          {/* Date */}
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Interview Date & Time
                            </label>

                            <input
                              type="datetime-local"
                              value={
                                editScheduledAt
                              }
                              onChange={(e) =>
                                setEditScheduledAt(
                                  e.target.value
                                )
                              }
                              required
                              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                            />
                          </div>

                          {/* Type */}
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Interview Type
                            </label>

                            <select
                              value={
                                editInterviewType
                              }
                              onChange={(e) =>
                                setEditInterviewType(
                                  e.target.value as InterviewType
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                            >
                              <option value="Video">
                                Video
                              </option>

                              <option value="Phone">
                                Phone
                              </option>

                              <option value="In-Person">
                                In-Person
                              </option>
                            </select>
                          </div>

                          {/* Interviewer */}
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Interviewer
                            </label>

                            <input
                              type="text"
                              value={
                                editInterviewer
                              }
                              onChange={(e) =>
                                setEditInterviewer(
                                  e.target.value
                                )
                              }
                              placeholder="Enter interviewer name"
                              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                            />
                          </div>

                          {/* Status */}
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Interview Status
                            </label>

                            <select
                              value={
                                editStatus
                              }
                              onChange={(e) =>
                                setEditStatus(
                                  e.target.value as InterviewStatus
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                            >
                              <option value="Scheduled">
                                Scheduled
                              </option>

                              <option value="Completed">
                                Completed
                              </option>

                              <option value="Cancelled">
                                Cancelled
                              </option>

                              <option value="Rescheduled">
                                Rescheduled
                              </option>
                            </select>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Interview Notes
                            </label>

                            <textarea
                              value={
                                editNotes
                              }
                              onChange={(e) =>
                                setEditNotes(
                                  e.target.value
                                )
                              }
                              rows={5}
                              placeholder="Add notes about this interview..."
                              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                            />
                          </div>

                          {/* Feedback */}
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Interview Feedback
                            </label>

                            <textarea
                              value={
                                editFeedback
                              }
                              onChange={(e) =>
                                setEditFeedback(
                                  e.target.value
                                )
                              }
                              rows={5}
                              placeholder="Enter candidate interview feedback..."
                              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                            />
                          </div>

                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">

                          <button
                            type="button"
                            onClick={
                              handleCancelEdit
                            }
                            disabled={
                              savingEdit
                            }
                            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            disabled={
                              savingEdit
                            }
                            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingEdit
                              ? "Saving..."
                              : "Save Changes"}
                          </button>

                        </div>

                      </form>
                    ) : (

                      /* ================================= */
                      /* DISPLAY MODE */
                      /* ================================= */

                      <div>

                        {/* Candidate / Job */}
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-3">

                              <h3 className="text-xl font-bold text-slate-900">
                                {applicant?.name ||
                                  "Unknown Applicant"}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                  interview.status
                                )}`}
                              >
                                {interview.status}
                              </span>

                            </div>

                            <p className="mt-1 text-sm font-medium text-slate-500">
                              {job?.title ||
                                "Unknown Job"}
                            </p>

                            {/* Information cards */}
                            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                              <div className="rounded-lg bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Date & Time
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {new Date(
                                    interview.scheduledAt
                                  ).toLocaleString()}
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Type
                                </p>

                                <span
                                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getInterviewTypeClasses(
                                    interview.interviewType
                                  )}`}
                                >
                                  {interview.interviewType}
                                </span>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Interviewer
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {interview.interviewer ||
                                    "Not specified"}
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Candidate Email
                                </p>

                                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                                  {applicant?.email ||
                                    "Not available"}
                                </p>
                              </div>

                            </div>

                          </div>
                        </div>

                        {/* ================================= */}
                        {/* INTERVIEW NOTES */}
                        {/* ================================= */}

                        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">

                          <div className="flex flex-wrap items-center justify-between gap-3">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Interview Notes
                            </p>

                            {!isEditingNotes && (
                              <div className="flex gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditNotes(
                                      interview
                                    )
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteNotes(
                                      interview._id
                                    )
                                  }
                                  className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>

                              </div>
                            )}

                          </div>

                          {isEditingNotes ? (
                            <div className="mt-3">

                              <textarea
                                value={
                                  notesText
                                }
                                onChange={(e) =>
                                  setNotesText(
                                    e.target.value
                                  )
                                }
                                rows={4}
                                placeholder="Enter interview notes..."
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                              />

                              <div className="mt-3 flex flex-wrap justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNotesId(
                                      null
                                    );
                                    setNotesText(
                                      ""
                                    );
                                  }}
                                  disabled={
                                    savingNotes
                                  }
                                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveNotes(
                                      interview._id
                                    )
                                  }
                                  disabled={
                                    savingNotes
                                  }
                                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {savingNotes
                                    ? "Saving..."
                                    : "Save Notes"}
                                </button>

                              </div>

                            </div>
                          ) : (
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {interview.notes ||
                                "No interview notes added."}
                            </p>
                          )}

                        </div>

                        {/* ================================= */}
                        {/* INTERVIEW FEEDBACK */}
                        {/* ================================= */}

                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">

                          <div className="flex flex-wrap items-center justify-between gap-3">

                            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                              Interview Feedback
                            </p>

                            {!isEditingFeedback && (
                              <div className="flex gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditFeedback(
                                      interview
                                    )
                                  }
                                  className="rounded-lg border border-green-300 bg-white px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteFeedback(
                                      interview._id
                                    )
                                  }
                                  className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>

                              </div>
                            )}

                          </div>

                          {isEditingFeedback ? (
                            <div className="mt-3">

                              <textarea
                                value={
                                  feedbackText
                                }
                                onChange={(e) =>
                                  setFeedbackText(
                                    e.target.value
                                  )
                                }
                                rows={4}
                                placeholder="Enter interview feedback..."
                                className="w-full rounded-lg border border-green-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
                              />

                              <div className="mt-3 flex flex-wrap justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFeedbackId(
                                      null
                                    );
                                    setFeedbackText(
                                      ""
                                    );
                                  }}
                                  disabled={
                                    savingFeedback
                                  }
                                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveFeedback(
                                      interview._id
                                    )
                                  }
                                  disabled={
                                    savingFeedback
                                  }
                                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {savingFeedback
                                    ? "Saving..."
                                    : "Save Feedback"}
                                </button>

                              </div>

                            </div>
                          ) : (
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-green-800">
                              {interview.feedback ||
                                "No interview feedback added."}
                            </p>
                          )}

                        </div>

                        {/* ================================= */}
                        {/* ACTIONS */}
                        {/* ================================= */}

                        <div className="mt-5 flex flex-wrap gap-2">

                          {applicant?._id && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/applicants/${applicant._id}`
                                )
                              }
                              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              View Applicant
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleStartEdit(
                                interview
                              )
                            }
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                          >
                            Edit Interview
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusUpdate(
                                interview._id,
                                "Completed"
                              )
                            }
                            disabled={
                              interview.status ===
                              "Completed"
                            }
                            className="rounded-lg border border-green-300 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Mark Completed
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusUpdate(
                                interview._id,
                                "Cancelled"
                              )
                            }
                            disabled={
                              interview.status ===
                              "Cancelled"
                            }
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Cancel Interview
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                interview._id
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Delete Interview
                          </button>

                        </div>

                      </div>
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

export default Interviews;