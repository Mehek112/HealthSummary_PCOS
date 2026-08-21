import {
  LayoutDashboard,
  Activity,
  FileText,
  Folder,
  Info,
  User,
  LogOut,
} from "lucide-react";

import "./Navbar.css";

function Navbar({ onLogout, onNavigate, activePage }) {
  return (
    <nav className="navbar">

      <div className="nav-brand">
        PCOSense
      </div>

      <div className="nav-links">

        <button
          className={activePage === "dashboard" ? "active-link" : ""}
          onClick={() => onNavigate("dashboard")}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          className={activePage === "predict" ? "active-link" : ""}
          onClick={() => onNavigate("predict")}
        >
          <Activity size={18} />
          Predict PCOS
        </button>

        <button
          className={activePage === "summary" ? "active-link" : ""}
          onClick={() => onNavigate("summary")}
        >
          <FileText size={18} />
          Health Summary
        </button>

        <button onClick={() => onNavigate("records")}>
          <Folder size={18} />
          My Records
        </button>

        <button onClick={() => onNavigate("about")}>
          <Info size={18} />
          About Us
        </button>

      </div>

      <div className="nav-actions">

        <button>
          <User size={18} />
          Profile
        </button>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;