import React, { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "timeapp.timeentries";
const PROJECTS_KEY = "timeapp.projects";

export default function Timer({ initialProjectId = "", initialTaskId = "" }) {
  const [running, setRunning] = useState(false);
  const [startAt, setStartAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(
    initialProjectId || ""
  );
  const [selectedTask, setSelectedTask] = useState(initialTaskId || "");
  const rafRef = useRef();
  const startMetaRef = useRef({ projectId: null, taskId: null });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setEntries(JSON.parse(raw));
    const pr = localStorage.getItem(PROJECTS_KEY);
    if (pr) setProjects(JSON.parse(pr));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function tick() {
    setElapsed(Date.now() - startAt);
    rafRef.current = requestAnimationFrame(tick);
  }

  function start() {
    setStartAt(Date.now());
    setElapsed(0);
    setRunning(true);
    startMetaRef.current = {
      projectId: selectedProject || null,
      taskId: selectedTask || null,
    };
  }

  function stop() {
    setRunning(false);
    const duration = Date.now() - startAt;
    setEntries((e) => [
      ...e,
      {
        id: Date.now().toString(),
        start: startAt,
        duration,
        projectId: startMetaRef.current.projectId,
        taskId: startMetaRef.current.taskId,
      },
    ]);
    setStartAt(null);
    setElapsed(0);
    startMetaRef.current = { projectId: null, taskId: null };
  }

  function fmt(ms) {
    const s = Math.floor(ms / 1000);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss
      .toString()
      .padStart(2, "0")}`;
  }

  function getProjectName(id) {
    return projects.find((p) => p.id === id)?.name || "—";
  }

  function getTaskName(projectId, taskId) {
    const p = projects.find((p) => p.id === projectId);
    return p?.tasks?.find((t) => t.id === taskId)?.name || "—";
  }

  useEffect(() => {
    // reset task selection if not in selected project
    if (selectedProject) {
      const p = projects.find((pr) => pr.id === selectedProject);
      if (!p) setSelectedTask("");
      else if (selectedTask && !p.tasks?.find((t) => t.id === selectedTask))
        setSelectedTask("");
    }
  }, [selectedProject, projects, selectedTask]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 12 }}>Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">(none)</option>
            {projects.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12 }}>Task</label>
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
          >
            <option value="">(none)</option>
            {projects
              .find((p) => p.id === selectedProject)
              ?.tasks?.map((t) => (
                <option value={t.id} key={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div style={{ fontSize: 24, marginBottom: 8 }}>
        {fmt(running ? elapsed : 0)}
      </div>
      <div>
        {running ? (
          <button onClick={stop}>Stop</button>
        ) : (
          <button onClick={start}>Start</button>
        )}
      </div>

      <h3>Entries</h3>
      <ul>
        {entries.map((en) => (
          <li key={en.id}>
            {new Date(en.start).toLocaleString()} — {fmt(en.duration)} —{" "}
            {getProjectName(en.projectId)}{" "}
            {en.taskId ? `/ ${getTaskName(en.projectId, en.taskId)}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
