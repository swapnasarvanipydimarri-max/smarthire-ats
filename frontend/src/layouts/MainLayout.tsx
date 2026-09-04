import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="md:ml-64">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div>
              <p className="text-sm font-medium text-slate-500">
                SmartHire ATS
              </p>
              <p className="text-xs text-slate-400">
                Recruitment Management System
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;