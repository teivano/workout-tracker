import React, { useState, useEffect } from "react";
import SessionList from "./components/SessionList";
import ExerciseList from "./components/ExerciseList";
import Timer from "./components/Timer";

export default function App() {
  const [sessions, setSessions] = useState(() => {
    try {
      const savedSessions = localStorage.getItem("sessions");
      return savedSessions ? JSON.parse(savedSessions) : [];
    } catch {
      return [];
    }
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mode, setMode] = useState("edit");

  const handleAddSet = (exerciseIndex, weight, reps) => {
    const updatedSessions = [...sessions];
    if (selectedSessionIndex !== null) {
      updatedSessions[selectedSessionIndex].exercises[exerciseIndex].sets.push({
        weight,
        reps,
        timestamp: new Date().toISOString(),
      });
      setSessions(updatedSessions);
      setSelectedSession(updatedSessions[selectedSessionIndex]);
      setResetTrigger((prev) => !prev);
    }
  };

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (sessionName) => {
    if (!sessionName.trim()) return;
    const newSession = { name: sessionName, exercises: [] };
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    setSelectedSession(newSession);
    setSelectedSessionIndex(updatedSessions.length - 1);
    setMode("action");
  };

  const addExercise = (sessionIndex, exerciseName) => {
    if (!exerciseName.trim()) return;
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].exercises.push({ name: exerciseName, sets: [] });
    setSessions(updatedSessions);
  };

  const deleteSession = (index) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    const updatedSessions = sessions.filter((_, i) => i !== index);
    setSessions(updatedSessions);
    if (selectedSessionIndex === index) {
      setSelectedSession(null);
      setSelectedSessionIndex(null);
      setMode("edit");
    }
  };

  const selectSession = (index) => {
    setSelectedSession(sessions[index]);
    setSelectedSessionIndex(index);
    setMode("action");
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className={`app-container ${isMenuOpen ? "menu-open" : ""}`}>

        <div className={`side-menu ${isMenuOpen ? "open" : ""}`}>
          <button
            className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✖" : "☰"}
          </button>
          <h2>Séances</h2>

          <div className="session-list">
            {sessions.map((session, index) => (
              <button key={index} onClick={() => selectSession(index)}>
                {session.name}
              </button>
            ))}
          </div>

          <button
            className="create-session-button"
            onClick={() => { setMode("edit"); setIsMenuOpen(false); }}
          >
            + Add / Edit une séance
          </button>
          <div className="menu-footer">Avec amour © Teivano 2025</div>
        </div>

        <div className="content">
          {mode === "edit" ? (
            <SessionList
              sessions={sessions}
              addSession={addSession}
              deleteSession={deleteSession}
              addExercise={addExercise}
            />
          ) : selectedSession ? (
            <>
              <Timer resetTrigger={resetTrigger} />
              <ExerciseList
                exercises={selectedSession.exercises}
                addSet={handleAddSet}
              />
            </>
          ) : (
            <h2>Sélectionnez une séance</h2>
          )}
        </div>
      </div>
    </>
  );
}
