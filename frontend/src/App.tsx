import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Jobs from "./pages/Jobs/Jobs";
import JobDetails from "./pages/Jobs/JobDetails";
import Applicants from "./pages/Applicants/Applicants";
import ApplicantDetails from "./pages/Applicants/ApplicantDetails";
import Profile from "./pages/Profile/Profile";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Pipeline from "./pages/pipeline/Pipeline";
import Interviews from "./pages/Interviews/Interviews";
import Calendar from "./pages/Calendar/Calendar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/jobs"
              element={<Jobs />}
            />

            <Route
              path="/jobs/:id"
              element={<JobDetails />}
            />

            <Route
              path="/applicants"
              element={<Applicants />}
            />

            <Route
              path="/applicants/:id"
              element={<ApplicantDetails />}
            />

            <Route
              path="/pipeline"
              element={<Pipeline />}
            />

            <Route
              path="/interviews"
              element={<Interviews />}
            />

            <Route
              path="/calendar"
              element={<Calendar />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;