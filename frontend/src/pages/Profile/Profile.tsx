import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Education {
  degree: string;
  college: string;
  fieldOfStudy?: string;
  startYear?: number;
  graduationYear?: number;
}

interface Certificate {
  _id?: string;
  name: string;
  organization?: string;
  yearEarned?: number;
  file?: string;
}

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  role: "recruiter";
  company?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  experience?: string;
  professionalSummary?: string;
  profileImage?: string;
  education: Education[];
  skills: string[];
  hobbies: string[];
  socialMedia: SocialMedia;
  certificates: Certificate[];
}

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [uploadingCertificate, setUploadingCertificate] =
    useState(false);

  const [generatingResume, setGeneratingResume] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // ==========================================
  // PROFILE FORM STATES
  // ==========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] =
    useState("");
  const [whatsappNumber, setWhatsappNumber] =
    useState("");
  const [company, setCompany] = useState("");
  const [experience, setExperience] =
    useState("");
  const [professionalSummary, setProfessionalSummary] =
    useState("");

  const [skills, setSkills] = useState("");
  const [hobbies, setHobbies] = useState("");

  const [education, setEducation] =
    useState<Education[]>([]);

  const [socialMedia, setSocialMedia] =
    useState<SocialMedia>({
      facebook: "",
      instagram: "",
      linkedin: "",
    });

  // ==========================================
  // CERTIFICATE STATES
  // ==========================================

  const [certificateName, setCertificateName] =
    useState("");

  const [certificateOrganization, setCertificateOrganization] =
    useState("");

  const [certificateYear, setCertificateYear] =
    useState("");

  const [certificateFile, setCertificateFile] =
    useState<File | null>(null);

  // ==========================================
  // PASSWORD STATES
  // ==========================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  // ==========================================
  // DELETE ACCOUNT STATES
  // ==========================================

  const [deletePassword, setDeletePassword] =
    useState("");

  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  const [deletingAccount, setDeletingAccount] =
    useState(false);

  const photoInputRef =
    useRef<HTMLInputElement | null>(null);

  const certificateInputRef =
    useRef<HTMLInputElement | null>(null);

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await axios.get(
        "/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = response.data.user;

      setProfile(user);

      setName(user.name || "");
      setEmail(user.email || "");
      setContactNumber(
        user.contactNumber || ""
      );
      setWhatsappNumber(
        user.whatsappNumber || ""
      );
      setCompany(user.company || "");
      setExperience(
        user.experience || ""
      );
      setProfessionalSummary(
        user.professionalSummary || ""
      );

      setSkills(
        Array.isArray(user.skills)
          ? user.skills.join(", ")
          : ""
      );

      setHobbies(
        Array.isArray(user.hobbies)
          ? user.hobbies.join(", ")
          : ""
      );

      setEducation(
        Array.isArray(user.education)
          ? user.education
          : []
      );

      setSocialMedia(
        user.socialMedia || {
          facebook: "",
          instagram: "",
          linkedin: "",
        }
      );
    } catch (error) {
      console.error(
        "FETCH PROFILE ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not load profile."
        );
      } else {
        setError(
          "Could not load profile."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ==========================================
  // EDUCATION
  // ==========================================

  const handleEducationChange = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    setEducation((current) => {
      const updated = [...current];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  const addEducation = () => {
    setEducation((current) => [
      ...current,
      {
        degree: "",
        college: "",
        fieldOfStudy: "",
        startYear: undefined,
        graduationYear: undefined,
      },
    ]);
  };

  const removeEducation = (
    index: number
  ) => {
    setEducation((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSaveProfile = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const cleanedEducation =
        education
          .filter(
            (item) =>
              item.degree?.trim() &&
              item.college?.trim()
          )
          .map((item) => ({
            degree: item.degree.trim(),
            college: item.college.trim(),
            fieldOfStudy:
              item.fieldOfStudy?.trim() || "",
            startYear: item.startYear
              ? Number(item.startYear)
              : undefined,
            graduationYear:
              item.graduationYear
                ? Number(item.graduationYear)
                : undefined,
          }));

      const profileData = {
        name: name.trim(),
        email: email.trim(),
        contactNumber:
          contactNumber.trim(),
        whatsappNumber:
          whatsappNumber.trim(),
        company: company.trim(),
        experience: experience.trim(),
        professionalSummary:
          professionalSummary.trim(),

        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),

        hobbies: hobbies
          .split(",")
          .map((hobby) => hobby.trim())
          .filter(Boolean),

        education: cleanedEducation,

        socialMedia: {
          facebook:
            socialMedia.facebook?.trim() ||
            "",
          instagram:
            socialMedia.instagram?.trim() ||
            "",
          linkedin:
            socialMedia.linkedin?.trim() ||
            "",
        },
      };

      const response =
        await axios.put(
          "/api/auth/profile",
          profileData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setProfile(response.data.user);

      setMessage(
        response.data.message ||
          "Profile updated successfully."
      );

      setIsEditing(false);

      localStorage.setItem(
        "user",
        JSON.stringify(
          response.data.user
        )
      );
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not update profile."
        );
      } else {
        setError(
          "Could not update profile."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT PROFILE
  // ==========================================

  const handleEdit = () => {
    setMessage("");
    setError("");
    setIsEditing(true);
  };

  // ==========================================
  // CANCEL PROFILE EDIT
  // ==========================================

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setContactNumber(
        profile.contactNumber || ""
      );
      setWhatsappNumber(
        profile.whatsappNumber || ""
      );
      setCompany(profile.company || "");
      setExperience(
        profile.experience || ""
      );
      setProfessionalSummary(
        profile.professionalSummary || ""
      );

      setSkills(
        profile.skills?.join(", ") || ""
      );

      setHobbies(
        profile.hobbies?.join(", ") || ""
      );

      setEducation(
        profile.education || []
      );

      setSocialMedia(
        profile.socialMedia || {
          facebook: "",
          instagram: "",
          linkedin: "",
        }
      );
    }

    setIsEditing(false);
    setMessage("");
    setError("");
  };

  // ==========================================
  // PROFILE PHOTO
  // ==========================================

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0] || null;

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG and PNG profile pictures are allowed."
      );

      e.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Profile picture must be smaller than 5 MB."
      );

      e.target.value = "";
      return;
    }

    setError("");

    uploadProfilePhoto(file);
  };

  const uploadProfilePhoto = async (
    file: File
  ) => {
    try {
      setUploadingPhoto(true);
      setMessage("");
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const formData = new FormData();

      formData.append(
        "profileImage",
        file
      );

      const response =
        await axios.post(
          "/api/profile/profile-image",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setProfile(response.data.user);

      setMessage(
        response.data.message ||
          "Profile picture uploaded successfully."
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          response.data.user
        )
      );
    } catch (error) {
      console.error(
        "UPLOAD PROFILE IMAGE ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Could not upload profile picture."
        );
      } else {
        setError(
          "Could not upload profile picture."
        );
      }
    } finally {
      setUploadingPhoto(false);

      if (photoInputRef.current) {
        photoInputRef.current.value =
          "";
      }
    }
  };

  const handleDeleteProfilePhoto =
    async () => {
      const confirmed =
        window.confirm(
          "Remove your profile picture?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setUploadingPhoto(true);
        setMessage("");
        setError("");

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
            "/api/profile/profile-image",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setProfile(response.data.user);

        setMessage(
          response.data.message ||
            "Profile picture removed."
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            response.data.user
          )
        );
      } catch (error) {
        console.error(
          "DELETE PROFILE IMAGE ERROR:",
          error
        );

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Could not remove profile picture."
          );
        } else {
          setError(
            "Could not remove profile picture."
          );
        }
      } finally {
        setUploadingPhoto(false);
      }
    };

  // ==========================================
  // CERTIFICATE FILE SELECT
  // ==========================================

  const handleCertificateFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0] || null;

    if (!file) {
      setCertificateFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    const validExtension =
      /\.(pdf|jpg|jpeg|png)$/i.test(
        file.name
      );

    if (
      !allowedTypes.includes(
        file.type
      ) &&
      !validExtension
    ) {
      setError(
        "Only PDF, JPG, JPEG and PNG certificate files are allowed."
      );

      e.target.value = "";
      setCertificateFile(null);
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Certificate file must be smaller than 5 MB."
      );

      e.target.value = "";
      setCertificateFile(null);
      return;
    }

    setError("");
    setCertificateFile(file);
  };

  // ==========================================
  // UPLOAD CERTIFICATE
  // ==========================================

  const handleUploadCertificate =
    async () => {
      if (!certificateName.trim()) {
        setError(
          "Certificate name is required."
        );
        return;
      }

      if (!certificateFile) {
        setError(
          "Please choose a certificate file."
        );
        return;
      }

      try {
        setUploadingCertificate(true);
        setMessage("");
        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          setError(
            "You are not logged in."
          );
          return;
        }

        const formData = new FormData();

        formData.append(
          "name",
          certificateName.trim()
        );

        formData.append(
          "organization",
          certificateOrganization.trim()
        );

        formData.append(
          "yearEarned",
          certificateYear
        );

        formData.append(
          "certificate",
          certificateFile
        );

        const response =
          await axios.post(
            "/api/profile/certificates",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setProfile(response.data.user);

        setMessage(
          response.data.message ||
            "Certificate uploaded successfully."
        );

        setCertificateName("");
        setCertificateOrganization("");
        setCertificateYear("");
        setCertificateFile(null);

        if (
          certificateInputRef.current
        ) {
          certificateInputRef.current.value =
            "";
        }
      } catch (error) {
        console.error(
          "UPLOAD CERTIFICATE ERROR:",
          error
        );

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Could not upload certificate."
          );
        } else {
          setError(
            "Could not upload certificate."
          );
        }
      } finally {
        setUploadingCertificate(false);
      }
    };

  // ==========================================
  // DELETE CERTIFICATE
  // ==========================================

  const handleDeleteCertificate =
    async (
      certificateId?: string
    ) => {
      if (!certificateId) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this certificate?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setMessage("");
        setError("");

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
            `/api/profile/certificates/${certificateId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setProfile(response.data.user);

        setMessage(
          response.data.message ||
            "Certificate deleted successfully."
        );
      } catch (error) {
        console.error(
          "DELETE CERTIFICATE ERROR:",
          error
        );

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Could not delete certificate."
          );
        } else {
          setError(
            "Could not delete certificate."
          );
        }
      }
    };


 // ==========================================
// GENERATE PROFESSIONAL RESUME
// ==========================================

const handleGenerateResume = async () => {
  try {
    setGeneratingResume(true);
    setMessage("");
    setError("");

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const response = await axios.get(
      "/api/resume/generate",
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType =
      response.headers["content-type"];

    // Make sure backend actually returned a PDF
    if (
      typeof contentType !== "string" ||
      !contentType.includes("application/pdf")
    ) {
      // Sometimes backend sends JSON error with blob response type
      const text =
        await response.data.text();

      try {
        const parsed = JSON.parse(text);

        setError(
          parsed.message ||
            "Resume generation failed."
        );
      } catch {
        setError(
          text ||
            "Resume generation failed."
        );
      }

      return;
    }

    const blob = new Blob(
      [response.data],
      {
        type: "application/pdf",
      }
    );

    const downloadUrl =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = downloadUrl;

    const safeName =
      (profile?.name ||
        "Professional_Profile")
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        );

    link.download =
      `${safeName}_Professional_Resume.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      downloadUrl
    );

    setMessage(
      "Professional resume generated successfully."
    );
  } catch (error) {
    console.error(
      "GENERATE RESUME ERROR:",
      error
    );

    // Handle backend errors returned as Blob
    if (
      axios.isAxiosError(error) &&
      error.response
    ) {
      const responseData =
        error.response.data;

      if (
        responseData instanceof Blob
      ) {
        try {
          const text =
            await responseData.text();

          try {
            const parsed =
              JSON.parse(text);

            setError(
              parsed.message ||
                "Resume generation failed."
            );
          } catch {
            setError(
              text ||
                "Resume generation failed."
            );
          }
        } catch {
          setError(
            "Resume generation failed."
          );
        }
      } else {
        setError(
          responseData?.message ||
            "Resume generation failed."
        );
      }
    } else {
      setError(
        "Could not generate resume."
      );
    }
  } finally {
    setGeneratingResume(false);
  }
};

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setChangingPassword(true);
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

        if (
          !currentPassword ||
          !newPassword ||
          !confirmPassword
        ) {
          setError(
            "Please fill all password fields."
          );
          return;
        }

        if (
          newPassword !==
          confirmPassword
        ) {
          setError(
            "New passwords do not match."
          );
          return;
        }

        if (newPassword.length < 6) {
          setError(
            "New password must be at least 6 characters."
          );
          return;
        }

        const response =
          await axios.put(
            "/api/auth/change-password",
            {
              currentPassword,
              newPassword,
              confirmPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setMessage(
          response.data.message ||
            "Password changed successfully."
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error(
          "CHANGE PASSWORD ERROR:",
          error
        );

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Could not change password."
          );
        } else {
          setError(
            "Could not change password."
          );
        }
      } finally {
        setChangingPassword(false);
      }
    };

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================

  const handleDeleteAccount =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setDeletingAccount(true);
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

        if (!deletePassword) {
          setError(
            "Please enter your password."
          );
          return;
        }

        if (
          deleteConfirmation !==
          "DELETE"
        ) {
          setError(
            'Please type "DELETE" to confirm.'
          );
          return;
        }

        const confirmed =
          window.confirm(
            "This will permanently delete your account. Continue?"
          );

        if (!confirmed) {
          return;
        }

        const response =
          await axios.delete(
            "/api/auth/account",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              data: {
                password:
                  deletePassword,
                confirmation:
                  deleteConfirmation,
              },
            }
          );

        setMessage(
          response.data.message ||
            "Account deleted successfully."
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } catch (error) {
        console.error(
          "DELETE ACCOUNT ERROR:",
          error
        );

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Could not delete account."
          );
        } else {
          setError(
            "Could not delete account."
          );
        }
      } finally {
        setDeletingAccount(false);
      }
    };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-red-600 shadow-sm">
        {error || "Profile not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Professional Profile
          </h1>

          <p className="mt-2 text-slate-600">
            Manage your recruiter profile and professional information.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Edit Profile
            </button>
          )}

          <button
            type="button"
            onClick={handleGenerateResume}
            disabled={generatingResume}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generatingResume
              ? "Generating Resume..."
              : "Generate Resume PDF"}
          </button>
        </div>
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
          PROFILE
      ========================================== */}

      <form
        onSubmit={handleSaveProfile}
        className="space-y-8"
      >
        {/* ==========================================
            PROFILE HEADER
        ========================================== */}

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div>
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-4xl font-bold text-slate-600">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.name
                    ?.charAt(0)
                    .toUpperCase()
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900">
                {profile.name}
              </h2>

              <p className="mt-1 text-slate-600">
                {profile.role}
                {profile.company
                  ? ` • ${profile.company}`
                  : ""}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {profile.email}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                <button
                  type="button"
                  onClick={() =>
                    photoInputRef.current?.click()
                  }
                  disabled={uploadingPhoto}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {uploadingPhoto
                    ? "Uploading..."
                    : "Change Photo"}
                </button>

                {profile.profileImage && (
                  <button
                    type="button"
                    onClick={handleDeleteProfilePhoto}
                    disabled={uploadingPhoto}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            PERSONAL INFORMATION
        ========================================== */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Personal Information
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                value={name}
                disabled={!isEditing}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                disabled={!isEditing}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Contact Number
              </label>

              <input
                type="text"
                value={contactNumber}
                disabled={!isEditing}
                onChange={(e) =>
                  setContactNumber(
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                WhatsApp Number
              </label>

              <input
                type="text"
                value={whatsappNumber}
                disabled={!isEditing}
                onChange={(e) =>
                  setWhatsappNumber(
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Role
              </label>

              <input
                type="text"
                value={profile.role}
                disabled
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 p-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Company
              </label>

              <input
                type="text"
                value={company}
                disabled={!isEditing}
                onChange={(e) =>
                  setCompany(e.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Experience
              </label>

              <input
                type="text"
                value={experience}
                disabled={!isEditing}
                onChange={(e) =>
                  setExperience(e.target.value)
                }
                placeholder="Example: 5 years in recruitment"
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Professional Summary
              </label>

              <textarea
                value={professionalSummary}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfessionalSummary(
                    e.target.value
                  )
                }
                placeholder="Write a short professional summary..."
                className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-50"
              />
            </div>
          </div>
        </section>

        {/* ==========================================
            EDUCATION
        ========================================== */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">
              Education Background
            </h2>

            {isEditing && (
              <button
                type="button"
                onClick={addEducation}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                + Add Education
              </button>
            )}
          </div>

          <div className="mt-6 space-y-5">
            {education.length === 0 ? (
              <p className="text-slate-500">
                No education information added yet.
              </p>
            ) : (
              education.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  {isEditing ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Degree"
                        value={item.degree}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "degree",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-slate-300 p-3"
                      />

                      <input
                        type="text"
                        placeholder="College / University"
                        value={item.college}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "college",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-slate-300 p-3"
                      />

                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={
                          item.fieldOfStudy || ""
                        }
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "fieldOfStudy",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-slate-300 p-3"
                      />

                      <input
                        type="number"
                        placeholder="Start Year"
                        value={item.startYear || ""}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "startYear",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-slate-300 p-3"
                      />

                      <input
                        type="number"
                        placeholder="Graduation Year"
                        value={
                          item.graduationYear || ""
                        }
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "graduationYear",
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-slate-300 p-3"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeEducation(index)
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                      >
                        Remove Education
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-slate-900">
                        {item.degree}
                      </h3>

                      <p className="mt-1 text-slate-600">
                        {item.college}
                      </p>

                      {item.fieldOfStudy && (
                        <p className="mt-1 text-sm text-slate-500">
                          {item.fieldOfStudy}
                        </p>
                      )}

                      {(item.startYear ||
                        item.graduationYear) && (
                        <p className="mt-2 text-sm text-slate-400">
                          {item.startYear || "—"} →{" "}
                          {item.graduationYear ||
                            "Present"}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* ==========================================
            SKILLS
        ========================================== */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Skills
          </h2>

          {isEditing ? (
            <input
              type="text"
              value={skills}
              onChange={(e) =>
                setSkills(e.target.value)
              }
              placeholder="React, Node.js, Recruitment, HR"
              className="mt-4 w-full rounded-lg border border-slate-300 p-3"
            />
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.length === 0 ? (
                <p className="text-slate-500">
                  No skills added yet.
                </p>
              ) : (
                profile.skills.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {skill}
                    </span>
                  )
                )
              )}
            </div>
          )}
        </section>

        {/* ==========================================
            HOBBIES
        ========================================== */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Hobbies
          </h2>

          {isEditing ? (
            <input
              type="text"
              value={hobbies}
              onChange={(e) =>
                setHobbies(e.target.value)
              }
              placeholder="Reading, Music, Travel"
              className="mt-4 w-full rounded-lg border border-slate-300 p-3"
            />
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.hobbies.length === 0 ? (
                <p className="text-slate-500">
                  No hobbies added yet.
                </p>
              ) : (
                profile.hobbies.map(
                  (hobby, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {hobby}
                    </span>
                  )
                )
              )}
            </div>
          )}
        </section>

        {/* ==========================================
            SOCIAL MEDIA
        ========================================== */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Social Media
          </h2>

          {isEditing ? (
            <div className="mt-6 grid gap-4">
              <input
                type="url"
                placeholder="Facebook URL"
                value={
                  socialMedia.facebook || ""
                }
                onChange={(e) =>
                  setSocialMedia((current) => ({
                    ...current,
                    facebook: e.target.value,
                  }))
                }
                className="rounded-lg border border-slate-300 p-3"
              />

              <input
                type="url"
                placeholder="Instagram URL"
                value={
                  socialMedia.instagram || ""
                }
                onChange={(e) =>
                  setSocialMedia((current) => ({
                    ...current,
                    instagram: e.target.value,
                  }))
                }
                className="rounded-lg border border-slate-300 p-3"
              />

              <input
                type="url"
                placeholder="LinkedIn URL"
                value={
                  socialMedia.linkedin || ""
                }
                onChange={(e) =>
                  setSocialMedia((current) => ({
                    ...current,
                    linkedin: e.target.value,
                  }))
                }
                className="rounded-lg border border-slate-300 p-3"
              />
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {profile.socialMedia?.facebook && (
                <a
                  href={
                    profile.socialMedia.facebook
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Facebook
                </a>
              )}

              {profile.socialMedia?.instagram && (
                <a
                  href={
                    profile.socialMedia.instagram
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-pink-600 hover:underline"
                >
                  Instagram
                </a>
              )}

              {profile.socialMedia?.linkedin && (
                <a
                  href={
                    profile.socialMedia.linkedin
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-700 hover:underline"
                >
                  LinkedIn
                </a>
              )}

              {!profile.socialMedia?.facebook &&
                !profile.socialMedia?.instagram &&
                !profile.socialMedia?.linkedin && (
                  <p className="text-slate-500">
                    No social media accounts added.
                  </p>
                )}
            </div>
          )}
        </section>

        {/* ==========================================
            CERTIFICATIONS
        ========================================== */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Certifications
          </h2>

          <div className="mt-6 rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">
              Add Certificate
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Certificate name"
                value={certificateName}
                onChange={(e) =>
                  setCertificateName(
                    e.target.value
                  )
                }
                className="rounded-lg border border-slate-300 p-3"
              />

              <input
                type="text"
                placeholder="Issuing organization"
                value={certificateOrganization}
                onChange={(e) =>
                  setCertificateOrganization(
                    e.target.value
                  )
                }
                className="rounded-lg border border-slate-300 p-3"
              />

              <input
                type="number"
                placeholder="Year earned"
                min="1900"
                max="2100"
                value={certificateYear}
                onChange={(e) =>
                  setCertificateYear(
                    e.target.value
                  )
                }
                className="rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">
                Certificate File
              </label>

              <input
                ref={certificateInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={
                  handleCertificateFileChange
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 p-3 text-sm"
              />

              {certificateFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected:{" "}
                  {certificateFile.name}
                </p>
              )}

              <p className="mt-1 text-xs text-slate-400">
                PDF, JPG, JPEG or PNG • Maximum 5 MB
              </p>
            </div>

            <button
              type="button"
              onClick={handleUploadCertificate}
              disabled={
                uploadingCertificate
              }
              className="mt-4 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {uploadingCertificate
                ? "Uploading..."
                : "Upload Certificate"}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {profile.certificates.length === 0 ? (
              <p className="text-slate-500">
                No certificates uploaded yet.
              </p>
            ) : (
              profile.certificates.map(
                (certificate, index) => (
                  <div
                    key={
                      certificate._id ||
                      index
                    }
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {certificate.name}
                        </h3>

                        {certificate.organization && (
                          <p className="mt-1 text-slate-600">
                            {
                              certificate.organization
                            }
                          </p>
                        )}

                        {certificate.yearEarned && (
                          <p className="mt-1 text-sm text-slate-500">
                            Earned:{" "}
                            {
                              certificate.yearEarned
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {certificate.file && (
                          <a
                            href={
                              certificate.file
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                          >
                            View
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCertificate(
                              certificate._id
                            )
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </section>

        {/* ==========================================
            UPDATE PROFILE
        ========================================== */}

        {isEditing && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Update Profile"}
            </button>
          </div>
        )}
      </form>

      {/* ==========================================
          ACCOUNT SECURITY
      ========================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Account Security
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Manage your password and account access.
        </p>

        {/* CHANGE PASSWORD */}
        <form
          onSubmit={handleChangePassword}
          className="mt-6 max-w-2xl space-y-4"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Change Password
          </h3>

          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(
                e.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 p-3"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 p-3"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 p-3"
          />

          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {changingPassword
              ? "Changing Password..."
              : "Change Password"}
          </button>
        </form>

        {/* DELETE ACCOUNT */}
        <div className="mt-10 border-t border-slate-200 pt-8">
          <h3 className="text-lg font-semibold text-red-600">
            Delete Account
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            This permanently deletes your SmartHire account.
          </p>

          <form
            onSubmit={handleDeleteAccount}
            className="mt-5 max-w-2xl space-y-4"
          >
            <input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) =>
                setDeletePassword(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 p-3"
            />

            <input
              type="text"
              placeholder='Type DELETE to confirm'
              value={deleteConfirmation}
              onChange={(e) =>
                setDeleteConfirmation(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 p-3"
            />

            <button
              type="submit"
              disabled={deletingAccount}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deletingAccount
                ? "Deleting Account..."
                : "Delete Account"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Profile;