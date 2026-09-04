import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 overflow-y-auto bg-slate-900 p-5 text-white">
      <h1 className="mb-8 text-2xl font-bold">
        SmartHire
      </h1>

      <nav className="space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700 font-semibold"
                : "hover:bg-slate-800"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700 font-semibold"
                : "hover:bg-slate-800"
            }`
          }
        >
          Jobs
        </NavLink>

        <NavLink
          to="/applicants"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700 font-semibold"
                : "hover:bg-slate-800"
            }`
          }
        >
          Applicants
        </NavLink>

        <NavLink
          to="/pipeline"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700 font-semibold"
                : "hover:bg-slate-800"
            }`
          }
        >
          Recruitment Pipeline
        </NavLink>

        <NavLink
          to="/interviews"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700 font-semibold"
                : "hover:bg-slate-800"
            }`
          }
        >
          Interviews
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700 font-semibold"
                : "hover:bg-slate-800"
            }`
          }
        >
          Interview Calendar
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700 font-semibold"
                : "hover:bg-slate-800"
            }`
          }
        >
          Profile
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;