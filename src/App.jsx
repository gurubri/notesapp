import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Nav from "./components/Nav";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import TimerPage from "./pages/TimerPage";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div className="app-container" style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
