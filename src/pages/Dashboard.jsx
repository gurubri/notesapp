import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ENTRIES_KEY = "timeapp.timeentries";
const PROJECTS_KEY = "timeapp.projects";

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${hh}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const e = JSON.parse(localStorage.getItem(ENTRIES_KEY) || "[]");
    setEntries(e);
    const p = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]");
    setProjects(p);
  }, []);

  const recent = [...entries].sort((a, b) => b.start - a.start).slice(0, 5);

  const totalsByProject = entries.reduce((acc, en) => {
    const key = en.projectId || "none";
    acc[key] = (acc[key] || 0) + en.duration;
    return acc;
  }, {});

  const topProjects = Object.entries(totalsByProject)
    .map(([id, dur]) => ({ id, dur }))
    .sort((a, b) => b.dur - a.dur)
    .slice(0, 5);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const totalToday = entries
    .filter((en) => en.start >= todayStart.getTime())
    .reduce((s, e) => s + e.duration, 0);
  const totalWeek = entries
    .filter((en) => en.start >= weekStart.getTime())
    .reduce((s, e) => s + e.duration, 0);

  function getProjectName(id) {
    return projects.find((p) => p.id === id)?.name || "Unassigned";
  }

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1 }}>
          <h3>Total Today</h3>
          <div style={{ fontSize: 20 }}>{fmt(totalToday)}</div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h3>Total This Week</h3>
          <div style={{ fontSize: 20 }}>{fmt(totalWeek)}</div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h3>Top Projects</h3>
          <ul>
            {topProjects.map((t) => (
              <li key={t.id}>
                {t.id === "none" ? "Unassigned" : getProjectName(t.id)} —{" "}
                {fmt(t.dur)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>Recent Entries</h3>
        <ul>
          {recent.map((r) => (
            <li key={r.id} style={{ marginBottom: 6 }}>
              {new Date(r.start).toLocaleString()} — {fmt(r.duration)} —{" "}
              {getProjectName(r.projectId)}{" "}
              <button
                onClick={() =>
                  navigate(
                    `/timer?projectId=${r.projectId || ""}&taskId=${r.taskId || ""}`
                  )
                }
                style={{ marginLeft: 8 }}
              >
                Start timer for this task
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
