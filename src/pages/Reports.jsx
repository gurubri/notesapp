import React, { useEffect, useState } from "react";

const ENTRIES_KEY = "timeapp.timeentries";
const PROJECTS_KEY = "timeapp.projects";

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${hh}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

function downloadCSV(rows, filename = "report.csv") {
  const csv = [
    Object.keys(rows[0]).join(","),
    ...rows.map((r) => Object.values(r).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    setEntries(JSON.parse(localStorage.getItem(ENTRIES_KEY) || "[]"));
    setProjects(JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]"));
  }, []);

  const filters = {};
  if (start) filters.start = new Date(start).getTime();
  if (end) filters.end = new Date(end).getTime() + 24 * 60 * 60 * 1000;

  const rows = entries
    .filter(
      (en) =>
        (filters.start ? en.start >= filters.start : true) &&
        (filters.end ? en.start <= filters.end : true)
    )
    .map((en) => ({
      id: en.id,
      start: new Date(en.start).toLocaleString(),
      duration: en.duration,
      project:
        projects.find((p) => p.id === en.projectId)?.name || "Unassigned",
      task:
        projects
          .find((p) => p.id === en.projectId)
          ?.tasks?.find((t) => t.id === en.taskId)?.name || "",
    }));

  const totalsByProject = rows.reduce((acc, r) => {
    acc[r.project] = (acc[r.project] || 0) + r.duration;
    return acc;
  }, {});

  const totalsTable = Object.entries(totalsByProject).map(([project, dur]) => ({
    project,
    duration: fmt(dur),
  }));

  return (
    <div>
      <h2>Reports</h2>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Start</label>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <label style={{ marginLeft: 12, marginRight: 8 }}>End</label>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <button
          style={{ marginLeft: 12 }}
          onClick={() => downloadCSV(rows, "time-report.csv")}
        >
          Export CSV
        </button>
      </div>

      <div className="card">
        <h3>Totals by Project</h3>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {totalsTable.map((t) => (
              <tr key={t.project}>
                <td>{t.project}</td>
                <td>{t.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Entries</h3>
        <table>
          <thead>
            <tr>
              <th>Start</th>
              <th>Duration</th>
              <th>Project</th>
              <th>Task</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.start}</td>
                <td>{fmt(r.duration)}</td>
                <td>{r.project}</td>
                <td>{r.task}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
