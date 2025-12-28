import React from "react";
import { useLocation } from "react-router-dom";
import Timer from "../components/Timer";

export default function TimerPage() {
  const params = new URLSearchParams(useLocation().search);
  const initialProjectId = params.get("projectId") || "";
  const initialTaskId = params.get("taskId") || "";

  return (
    <div>
      <h2>Timer</h2>
      <Timer
        initialProjectId={initialProjectId}
        initialTaskId={initialTaskId}
      />
    </div>
  );
}
