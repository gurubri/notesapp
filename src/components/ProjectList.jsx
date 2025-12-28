import React, { useState, useEffect } from "react";

const STORAGE_KEY = "timeapp.projects";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setProjects(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  function addProject(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setProjects((p) => [
      ...p,
      { id: Date.now().toString(), name: name.trim(), tasks: [] },
    ]);
    setName("");
  }

  function removeProject(id) {
    setProjects((p) => p.filter((x) => x.id !== id));
  }

  const [taskNameByProject, setTaskNameByProject] = useState({});

  function addTask(projectId, e) {
    e.preventDefault();
    const tname = (taskNameByProject[projectId] || "").trim();
    if (!tname) return;
    setProjects((p) =>
      p.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              tasks: [
                ...(proj.tasks || []),
                { id: Date.now().toString(), name: tname },
              ],
            }
          : proj
      )
    );
    setTaskNameByProject((s) => ({ ...s, [projectId]: "" }));
  }

  function removeTask(projectId, taskId) {
    setProjects((p) =>
      p.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              tasks: (proj.tasks || []).filter((t) => t.id !== taskId),
            }
          : proj
      )
    );
  }

  return (
    <div>
      <form onSubmit={addProject} style={{ marginBottom: 12 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {projects.map((proj) => (
          <li key={proj.id} style={{ marginBottom: 8 }}>
            <div>
              <strong>{proj.name}</strong>{" "}
              <button
                onClick={() => removeProject(proj.id)}
                style={{ marginLeft: 8 }}
              >
                Delete
              </button>
            </div>

            <ul>
              {(proj.tasks || []).map((t) => (
                <li key={t.id}>
                  {t.name}{" "}
                  <button onClick={() => removeTask(proj.id, t.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={(e) => addTask(proj.id, e)}>
              <input
                value={taskNameByProject[proj.id] || ""}
                onChange={(e) =>
                  setTaskNameByProject((s) => ({
                    ...s,
                    [proj.id]: e.target.value,
                  }))
                }
                placeholder="New task name"
              />
              <button type="submit">Add task</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
