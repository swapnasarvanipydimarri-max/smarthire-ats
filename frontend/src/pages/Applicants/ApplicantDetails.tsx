import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";

interface Job {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  skills?: string[];
}

type ApplicantStatus =
  | "Applied"
  | "Screening"
  | "Shortlisted"
  | "Interview"
  | "Rejected"
  | "Hired";

interface Applicant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  state?: string;
  graduationYear?: number;
  jobExpectation?: number;
  skills?: string[];
  resume?: string;

  status: ApplicantStatus;
  appliedAt?: string;
  job?: Job | null;
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
}

interface ApplicantNote {
  _id: string;
  applicant: string;
  recruiter: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

function ApplicantDetails() {
  const { id } =
    useParams<{ id: string }>();

  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const [applicant, setApplicant] =
    useState<Applicant | null>(null);

  const [interviews, setInterviews] =
    useState<Interview[]>([]);

  const [notes, setNotes] =
    useState<ApplicantNote[]>([]);

  // ==========================================
  // MATCH SCORE STATE
  // ==========================================

  const [matchScore, setMatchScore] =
    useState(0);

  const [matchingSkills, setMatchingSkills] =
    useState<string[]>([]);

  const [missingSkills, setMissingSkills] =
    useState<string[]>([]);

  // ==========================================
  // LOADING STATE
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  const [interviewLoading, setInterviewLoading] =
    useState(true);

  const [notesLoading, setNotesLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // INTERVIEW FORM STATE
  // ==========================================

  const [showInterviewForm, setShowInterviewForm] =
    useState(false);

  const [scheduledAt, setScheduledAt] =
    useState("");

  const [interviewType, setInterviewType] =
    useState<InterviewType>("Video");

  const [interviewer, setInterviewer] =
    useState("");

  const [interviewNotes, setInterviewNotes] =
    useState("");

  const [creatingInterview, setCreatingInterview] =
    useState(false);

  // ==========================================
  // NOTES STATE
  // ==========================================

  const [showNoteForm, setShowNoteForm] =
    useState(false);

  const [newNote, setNewNote] =
    useState("");

  const [creatingNote, setCreatingNote] =
    useState(false);

  const [editingNoteId, setEditingNoteId] =
    useState<string | null>(null);

  const [editNoteText, setEditNoteText] =
    useState("");

  const [savingNote, setSavingNote] =
    useState(false);

  // ==========================================
  // FETCH APPLICANT
  // ==========================================

  const fetchApplicant = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError(
          "You are not logged in."
        );
        return;
      }

      if (!id) {
        setError(
          "Applicant ID is missing."
        );
        return;
      }

      const response =
        await axios.get(
          `/api/applicants/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setApplicant(
        response.data.applicant
      );

      setMatchScore(
        response.data.matchScore ?? 0
      );

      setMatchingSkills(
        response.data.matchingSkills ||
          []
      );

      setMissingSkills(
        response.data.missingSkills ||
          []
      );
    } catch (error) {
      console.error(
        "FETCH APPLICANT ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Failed to load applicant details."
        );
      } else {
        setError(
          "Failed to load applicant details."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH INTERVIEWS
  // ==========================================

  const fetchInterviews = async () => {
    try {
      setInterviewLoading(true);

      if (!token || !id) {
        return;
      }

      const response =
        await axios.get(
          "/api/interviews",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const currentApplicantInterviews =
        response.data.interviews.filter(
          (interview: {
            applicant?: {
              _id?: string;
            } | string;
          }) => {
            if (
              typeof interview.applicant ===
              "string"
            ) {
              return (
                interview.applicant ===
                id
              );
            }

            return (
              interview.applicant?._id ===
              id
            );
          }
        );

      setInterviews(
        currentApplicantInterviews
      );
    } catch (error) {
      console.error(
        "FETCH INTERVIEWS ERROR:",
        error
      );
    } finally {
      setInterviewLoading(false);
    }
  };

  // ==========================================
  // FETCH NOTES
  // ==========================================

  const fetchNotes = async () => {
    try {
      setNotesLoading(true);

      if (!token || !id) {
        return;
      }

      const response =
        await axios.get(
          `/api/applicant-notes/applicant/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setNotes(
        response.data.notes || []
      );
    } catch (error) {
      console.error(
        "FETCH APPLICANT NOTES ERROR:",
        error
      );
    } finally {
      setNotesLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchApplicant();
    fetchInterviews();
    fetchNotes();
  }, [id]);

  // ==========================================
  // UPDATE APPLICANT STATUS
  // ==========================================

  const handleStatusUpdate = async (
    newStatus: ApplicantStatus
  ) => {
    if (!applicant) {
      return;
    }

    try {
      await axios.put(
        `/api/applicants/${applicant._id}`,
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

      setApplicant({
        ...applicant,
        status: newStatus,
      });
    } catch (error) {
      console.error(
        "UPDATE APPLICANT STATUS ERROR:",
        error
      );

      alert(
        "Failed to update applicant status."
      );
    }
  };

  // ==========================================
  // CREATE INTERVIEW
  // ==========================================

  const handleCreateInterview = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!applicant) {
      return;
    }

    if (!scheduledAt) {
      alert(
        "Please select an interview date and time."
      );
      return;
    }

    try {
      setCreatingInterview(true);

      const response =
        await axios.post(
          "/api/interviews",
          {
            applicant:
              applicant._id,
            scheduledAt,
            interviewType,
            interviewer,
            notes: interviewNotes,
            status: "Scheduled",
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const newInterview =
        response.data.interview;

      setInterviews((current) => [
        ...current,
        newInterview,
      ]);

      setApplicant({
        ...applicant,
        status: "Interview",
      });

      setScheduledAt("");
      setInterviewType("Video");
      setInterviewer("");
      setInterviewNotes("");

      setShowInterviewForm(false);

      alert(
        "Interview scheduled successfully."
      );
    } catch (error) {
      console.error(
        "CREATE INTERVIEW ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to schedule interview."
        );
      } else {
        alert(
          "Failed to schedule interview."
        );
      }
    } finally {
      setCreatingInterview(false);
    }
  };

  // ==========================================
  // CANCEL INTERVIEW
  // ==========================================

  const handleCancelInterview = async (
    interviewId: string
  ) => {
    try {
      await axios.put(
        `/api/interviews/${interviewId}`,
        {
          status: "Cancelled",
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setInterviews((current) =>
        current.map((interview) =>
          interview._id === interviewId
            ? {
                ...interview,
                status: "Cancelled",
              }
            : interview
        )
      );
    } catch (error) {
      console.error(
        "CANCEL INTERVIEW ERROR:",
        error
      );

      alert(
        "Failed to cancel interview."
      );
    }
  };

  // ==========================================
  // CREATE NOTE
  // ==========================================

  const handleCreateNote = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!applicant) {
      return;
    }

    const trimmedNote =
      newNote.trim();

    if (!trimmedNote) {
      alert(
        "Please enter a note."
      );
      return;
    }

    try {
      setCreatingNote(true);

      const response =
        await axios.post(
          "/api/applicant-notes",
          {
            applicant:
              applicant._id,
            note: trimmedNote,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const createdNote =
        response.data.note;

      setNotes((current) => [
        createdNote,
        ...current,
      ]);

      setNewNote("");
      setShowNoteForm(false);
    } catch (error) {
      console.error(
        "CREATE APPLICANT NOTE ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to create note."
        );
      } else {
        alert(
          "Failed to create note."
        );
      }
    } finally {
      setCreatingNote(false);
    }
  };

  // ==========================================
  // START EDIT NOTE
  // ==========================================

  const handleStartEditNote = (
    note: ApplicantNote
  ) => {
    setEditingNoteId(note._id);
    setEditNoteText(note.note);
  };

  // ==========================================
  // CANCEL EDIT NOTE
  // ==========================================

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditNoteText("");
  };

  // ==========================================
  // SAVE NOTE
  // ==========================================

  const handleSaveNote = async (
    noteId: string
  ) => {
    const trimmedNote =
      editNoteText.trim();

    if (!trimmedNote) {
      alert(
        "Note cannot be empty."
      );
      return;
    }

    try {
      setSavingNote(true);

      const response =
        await axios.put(
          `/api/applicant-notes/${noteId}`,
          {
            note: trimmedNote,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const updatedNote =
        response.data.note;

      setNotes((current) =>
        current.map((note) =>
          note._id === noteId
            ? updatedNote
            : note
        )
      );

      handleCancelEditNote();
    } catch (error) {
      console.error(
        "UPDATE APPLICANT NOTE ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to update note."
        );
      } else {
        alert(
          "Failed to update note."
        );
      }
    } finally {
      setSavingNote(false);
    }
  };

  // ==========================================
  // DELETE NOTE
  // ==========================================

  const handleDeleteNote = async (
    noteId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this note?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `/api/applicant-notes/${noteId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setNotes((current) =>
        current.filter(
          (note) =>
            note._id !== noteId
        )
      );

      if (
        editingNoteId === noteId
      ) {
        handleCancelEditNote();
      }
    } catch (error) {
      console.error(
        "DELETE APPLICANT NOTE ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to delete note."
        );
      } else {
        alert(
          "Failed to delete note."
        );
      }
    }
  };

  // ==========================================
  // DELETE APPLICANT
  // ==========================================

  const handleDelete = async () => {
    if (!applicant) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${applicant.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `/api/applicants/${applicant._id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      alert(
        "Applicant deleted successfully."
      );

      navigate("/applicants");
    } catch (error) {
      console.error(
        "DELETE APPLICANT ERROR:",
        error
      );

      alert(
        "Failed to delete applicant."
      );
    }
  };

  // ==========================================
  // APPLICANT STATUS STYLES
  // ==========================================

  const getStatusClasses = (
    status: ApplicantStatus
  ) => {
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

  // ==========================================
  // INTERVIEW STATUS STYLES
  // ==========================================

  const getInterviewStatusClasses = (
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
  // MATCH SCORE COLOR
  // ==========================================

  const getMatchScoreClasses = () => {
    if (matchScore >= 80) {
      return "text-green-600";
    }

    if (matchScore >= 50) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-600">
          Loading applicant details...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="p-6">

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/applicants")
          }
          className="mt-4 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
        >
          Back to Applicants
        </button>

      </div>
    );
  }

  // ==========================================
  // NO APPLICANT
  // ==========================================

  if (!applicant) {
    return (
      <div className="p-6">

        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <p className="text-slate-600">
            Applicant not found.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/applicants")
            }
            className="mt-4 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Back to Applicants
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="p-6">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <button
            type="button"
            onClick={() =>
              navigate("/applicants")
            }
            className="mb-3 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to Applicants
          </button>

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-3xl font-bold text-slate-900">
              {applicant.name}
            </h1>

            {matchScore >= 80 && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                Top Candidate
              </span>
            )}

          </div>

          <p className="mt-1 text-slate-500">
            Applicant Profile
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/applicants?edit=${applicant._id}`
              )
            }
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Edit Applicant
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>

      {/* ====================================== */}
      {/* STATUS */}
      {/* ====================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold text-slate-500">
              Current Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-bold ${getStatusClasses(
                applicant.status
              )}`}
            >
              {applicant.status}
            </span>

          </div>

          <div className="w-full md:w-72">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Change Status
            </label>

            <select
              value={applicant.status}
              onChange={(e) =>
                handleStatusUpdate(
                  e.target.value as ApplicantStatus
                )
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
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

        </div>

      </div>

      {/* ====================================== */}
      {/* MATCH SCORE */}
      {/* ====================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-xl font-bold text-slate-900">
                Candidate Match Score
              </h2>

              {matchScore >= 80 && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Strong Match
                </span>
              )}

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Based on the candidate's skills compared with the requirements of the selected job.
            </p>

          </div>

          <div className="text-center md:text-right">

            <p
              className={`text-5xl font-bold ${getMatchScoreClasses()}`}
            >
              {matchScore}%
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              Skill Match
            </p>

          </div>

        </div>

        {/* MATCHING SKILLS */}

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <div>

            <p className="mb-3 text-sm font-semibold text-slate-700">
              Matching Skills
            </p>

            {matchingSkills.length ===
            0 ? (
              <p className="text-sm text-slate-400">
                No matching skills found.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">

                {matchingSkills.map(
                  (
                    skill,
                    index
                  ) => (
                    <span
                      key={`matching-${index}`}
                      className="rounded-full bg-green-100 px-3 py-2 text-xs font-semibold text-green-700"
                    >
                      ✓ {skill}
                    </span>
                  )
                )}

              </div>
            )}

          </div>

          {/* MISSING SKILLS */}

          <div>

            <p className="mb-3 text-sm font-semibold text-slate-700">
              Missing Skills
            </p>

            {missingSkills.length ===
            0 ? (
              <p className="text-sm text-green-600">
                ✓ No required skills are missing.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">

                {missingSkills.map(
                  (
                    skill,
                    index
                  ) => (
                    <span
                      key={`missing-${index}`}
                      className="rounded-full bg-red-100 px-3 py-2 text-xs font-semibold text-red-700"
                    >
                      ✗ {skill}
                    </span>
                  )
                )}

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* INTERNAL NOTES */}
      {/* ====================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Internal Notes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Private recruiter notes about this applicant.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowNoteForm(
                !showNoteForm
              )
            }
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            {showNoteForm
              ? "Close Form"
              : "+ Add Note"}
          </button>

        </div>

        {showNoteForm && (
          <form
            onSubmit={
              handleCreateNote
            }
            className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5"
          >

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Note
            </label>

            <textarea
              value={newNote}
              onChange={(e) =>
                setNewNote(
                  e.target.value
                )
              }
              rows={5}
              placeholder="Write an internal recruiter note..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
              required
            />

            <div className="mt-4 flex justify-end">

              <button
                type="submit"
                disabled={
                  creatingNote
                }
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingNote
                  ? "Saving..."
                  : "Save Note"}
              </button>

            </div>

          </form>
        )}

        <div className="mt-6">

          {notesLoading ? (
            <p className="text-sm text-slate-500">
              Loading notes...
            </p>
          ) : notes.length ===
            0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

              <p className="text-slate-500">
                No internal notes yet.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Add the first note for this applicant.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {notes.map((note) => {
                const isEditing =
                  editingNoteId ===
                  note._id;

                return (
                  <div
                    key={note._id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                  >

                    {!isEditing ? (
                      <>
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                          <p className="whitespace-pre-wrap leading-7 text-slate-700">
                            {note.note}
                          </p>

                          <div className="flex shrink-0 gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleStartEditNote(
                                  note
                                )
                              }
                              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteNote(
                                  note._id
                                )
                              }
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                        <div className="mt-4 border-t border-slate-200 pt-3">

                          <p className="text-xs text-slate-400">
                            Created{" "}
                            {new Date(
                              note.createdAt
                            ).toLocaleString()}
                          </p>

                          {note.updatedAt !==
                            note.createdAt && (
                            <p className="mt-1 text-xs text-slate-400">
                              Updated{" "}
                              {new Date(
                                note.updatedAt
                              ).toLocaleString()}
                            </p>
                          )}

                        </div>
                      </>
                    ) : (
                      <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Edit Note
                        </label>

                        <textarea
                          value={
                            editNoteText
                          }
                          onChange={(e) =>
                            setEditNoteText(
                              e.target.value
                            )
                          }
                          rows={5}
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                        />

                        <div className="mt-4 flex flex-wrap justify-end gap-3">

                          <button
                            type="button"
                            onClick={
                              handleCancelEditNote
                            }
                            disabled={
                              savingNote
                            }
                            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSaveNote(
                                note._id
                              )
                            }
                            disabled={
                              savingNote
                            }
                            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingNote
                              ? "Saving..."
                              : "Save Changes"}
                          </button>

                        </div>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>

      {/* ====================================== */}
      {/* INTERVIEWS */}
      {/* ====================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Interviews
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Schedule and manage interviews for this applicant.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowInterviewForm(
                !showInterviewForm
              )
            }
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            {showInterviewForm
              ? "Close Form"
              : "Schedule Interview"}
          </button>

        </div>

        {showInterviewForm && (
          <form
            onSubmit={
              handleCreateInterview
            }
            className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5"
          >

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Interview Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) =>
                    setScheduledAt(
                      e.target.value
                    )
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Interview Type
                </label>

                <select
                  value={
                    interviewType
                  }
                  onChange={(e) =>
                    setInterviewType(
                      e.target.value as InterviewType
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
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

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Interviewer
                </label>

                <input
                  type="text"
                  value={
                    interviewer
                  }
                  onChange={(e) =>
                    setInterviewer(
                      e.target.value
                    )
                  }
                  placeholder="Enter interviewer name"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Interview Notes
                </label>

                <textarea
                  value={
                    interviewNotes
                  }
                  onChange={(e) =>
                    setInterviewNotes(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Add interview notes..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                />

              </div>

            </div>

            <div className="mt-5 flex justify-end">

              <button
                type="submit"
                disabled={
                  creatingInterview
                }
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingInterview
                  ? "Scheduling..."
                  : "Schedule Interview"}
              </button>

            </div>

          </form>
        )}

        <div className="mt-6">

          {interviewLoading ? (
            <p className="text-sm text-slate-500">
              Loading interviews...
            </p>
          ) : interviews.length ===
            0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">

              <p className="text-slate-500">
                No interviews scheduled yet.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {interviews.map(
                (interview) => (
                  <div
                    key={
                      interview._id
                    }
                    className="rounded-xl border border-slate-200 p-5"
                  >

                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="font-bold text-slate-900">
                            {new Date(
                              interview.scheduledAt
                            ).toLocaleString()}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getInterviewStatusClasses(
                              interview.status
                            )}`}
                          >
                            {
                              interview.status
                            }
                          </span>

                        </div>

                        <div className="mt-3 space-y-1 text-sm text-slate-600">

                          <p>
                            <span className="font-semibold">
                              Type:
                            </span>{" "}
                            {
                              interview.interviewType
                            }
                          </p>

                          <p>
                            <span className="font-semibold">
                              Interviewer:
                            </span>{" "}
                            {
                              interview.interviewer ||
                              "Not specified"
                            }
                          </p>

                          {interview.notes && (
                            <p>
                              <span className="font-semibold">
                                Notes:
                              </span>{" "}
                              {
                                interview.notes
                              }
                            </p>
                          )}

                          {interview.feedback && (
                            <p>
                              <span className="font-semibold">
                                Feedback:
                              </span>{" "}
                              {
                                interview.feedback
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      {interview.status ===
                        "Scheduled" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCancelInterview(
                              interview._id
                            )
                          }
                          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Cancel Interview
                        </button>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

      {/* ====================================== */}
      {/* APPLICANT INFORMATION */}
      {/* ====================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* PERSONAL INFORMATION */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Personal Information
          </h2>

          <div className="space-y-4">

            <div>
              <p className="text-sm text-slate-500">
                Full Name
              </p>

              <p className="font-semibold text-slate-900">
                {applicant.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Email
              </p>

              <p className="font-semibold text-slate-900">
                {applicant.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Phone
              </p>

              <p className="font-semibold text-slate-900">
                {applicant.phone ||
                  "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                College
              </p>

              <p className="font-semibold text-slate-900">
                {applicant.college ||
                  "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                State
              </p>

              <p className="font-semibold text-slate-900">
                {applicant.state ||
                  "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Graduation Year
              </p>

              <p className="font-semibold text-slate-900">
                {applicant.graduationYear ||
                  "Not provided"}
              </p>
            </div>

          </div>

        </div>

        {/* JOB INFORMATION */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Job Information
          </h2>

          {applicant.job ? (
            <div className="space-y-4">

              <div>

                <p className="text-sm text-slate-500">
                  Job Title
                </p>

                <p className="font-semibold text-slate-900">
                  {
                    applicant.job.title
                  }
                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Location
                </p>

                <p className="font-semibold text-slate-900">
                  {
                    applicant.job.location
                  }
                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Employment Type
                </p>

                <p className="font-semibold text-slate-900">
                  {
                    applicant.job
                      .employmentType
                  }
                </p>

              </div>

              {/* JOB REQUIRED SKILLS */}

              {applicant.job.skills &&
                applicant.job.skills
                  .length > 0 && (
                  <div>

                    <p className="mb-2 text-sm text-slate-500">
                      Required Skills
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {applicant.job.skills.map(
                        (
                          skill,
                          index
                        ) => (
                          <span
                            key={`job-skill-${index}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>
                )}

          </div>
          ) : (
            <p className="text-slate-500">
              No job assigned.
            </p>
          )}

        </div>

        {/* APPLICANT SKILLS */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Applicant Skills
          </h2>

          {applicant.skills &&
          applicant.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">

              {applicant.skills.map(
                (
                  skill,
                  index
                ) => (
                  <span
                    key={`applicant-skill-${index}`}
                    className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                  >
                    {skill}
                  </span>
                )
              )}

            </div>
          ) : (
            <p className="text-slate-500">
              No skills added.
            </p>
          )}

        </div>

        {/* ADDITIONAL INFORMATION */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Additional Information
          </h2>

          <div className="space-y-4">

            <div>

              <p className="text-sm text-slate-500">
                Expected Salary
              </p>

              <p className="font-semibold text-slate-900">
                {applicant.jobExpectation
                  ? `₹${applicant.jobExpectation.toLocaleString()}`
                  : "Not provided"}
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-500">
                Applied On
              </p>

              <p className="font-semibold text-slate-900">
                {applicant.appliedAt
                  ? new Date(
                      applicant.appliedAt
                    ).toLocaleDateString()
                  : "Not available"}
              </p>

            </div>

          </div>

        </div>

        {/* RESUME */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Resume
          </h2>

          {applicant.resume ? (
            <a
              href={
                applicant.resume
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              View Resume
            </a>
          ) : (
            <p className="text-slate-500">
              No resume uploaded.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default ApplicantDetails;