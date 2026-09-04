function Navbar() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Recruiter Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
          👤
        </div>

        <span className="font-medium text-slate-700">
          Recruiter
        </span>
      </div>
    </header>
  );
}

export default Navbar;