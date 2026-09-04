import { useState } from "react";
import axios from "axios";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

   try {
  const response = await axios.post("/api/auth/register",
    {
      name,
      email,
      password,
      company,
    }
  );

  console.log("REGISTER SUCCESS:", response.data);

  setMessage(
    response.data.message || "Registration successful!"
  );

  setName("");
  setEmail("");
  setPassword("");
  setCompany("");
} catch (error) {
  console.error("REGISTER ERROR:", error);

  if (axios.isAxiosError(error)) {
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);

    setError(
      error.response?.data?.message ||
        "Registration failed."
    );
  } else {
    setError("Something went wrong.");
  }
} finally {
  setLoading(false);
  }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">
          Create Account
        </h1>

        <p className="mt-2 text-slate-600">
          Register as a SmartHire recruiter
        </p>

        {message && (
          <div className="mt-4 rounded-lg bg-green-100 p-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
            required
          />

          <input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;