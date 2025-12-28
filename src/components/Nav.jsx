import React from "react";
import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <nav>
      <div className="app-container">
        <Link to="/">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/timer">Timer</Link>
        <Link to="/reports">Reports</Link>
      </div>
    </nav>
  );
}
