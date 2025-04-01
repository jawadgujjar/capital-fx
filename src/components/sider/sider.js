import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";
import Dashboard from "../dashboard"; // Assuming you already have this component
import User from "../user"; // Assuming you already have this component
import "./sider.css"; // Import your custom CSS
import Helpdesk from "../helpdesk";

const AdminPortal = () => {
  const [activeContent, setActiveContent] = useState("Dashboard"); // Default content
  const navigate = useNavigate(); // Initialize useNavigate

  // Hardcoded username instead of fetching from localStorage
  const username = "Admin AJC"; // Hardcoded username

  // Function to render the active content
  const renderContent = () => {
    switch (activeContent) {
      case "Dashboard":
        return <Dashboard />;

      case "User":
        return <User />;
      case "HelpDesk":
        return <Helpdesk />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="admin-portal">
      {/* Sidebar */}
      <div className="sider">
        <div className="sider-header">
          <h3 style={{ fontStyle: "italic" }}>{username}</h3> {/* Direct text display */}
        </div>
        <nav className="sider-links">
          {/* Links for Dashboard, Broker, and User */}
          {["Dashboard", "User", "HelpDesk"].map((item) => (
            <a
              key={item}
              className={activeContent === item ? "active" : ""}
              onClick={() => setActiveContent(item)}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Logout Button at the bottom */}
        <button className="logout-btn" onClick={handleLogout}>
          <LogoutOutlined /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="content-heading">{activeContent}</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPortal;
