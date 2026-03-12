import React, { useState } from "react";

export default function SessionList({ sessions, addSession, deleteSession, addExercise, renameSession, deleteExercise, moveExercise }) {
  const [sessionInput, setSessionInput] = useState("");
  const [exerciseInputs, setExerciseInputs] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const regex = /^[a-zA-Z\u00C0-\u00FF0-9\s]+$/;

  const handleAddSession = () => {
    if (!sessionInput.trim() || sessionInput.length > 20 || !regex.test(sessionInput)) {
      const el = document.querySelector(".session-input");
      el.classList.add("input-error");
      setTimeout(() => el.classList.remove("input-error"), 300);
      return;
    }
    addSession(sessionInput);
    setSessionInput("");
  };

  const handleAddExercise = (sessionIndex) => {
    const val = exerciseInputs[sessionIndex] || "";
    if (val.trim()) {
      addExercise(sessionIndex, val.trim());
      setExerciseInputs((prev) => ({ ...prev, [sessionIndex]: "" }));
    }
  };

  const startRename = (index, currentName) => {
    setRenamingIndex(index);
    setRenameValue(currentName);
  };

  const confirmRename = (index) => {
    if (renameValue.trim() && renameValue.length <= 20 && regex.test(renameValue)) {
      renameSession(index, renameValue.trim());
    }
    setRenamingIndex(null);
  };

  const toggleSession = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="session-list-page">
      <p className="session-page-title">Mes séances</p>

      <div className="input-row">
        <input
          type="text"
          className="session-input"
          value={sessionInput}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length <= 20 && /^[a-zA-Z\u00C0-\u00FF0-9\s]*$/.test(v)) setSessionInput(v);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAddSession()}
          placeholder="Nouvelle séance..."
        />
        <button className="add-button" onClick={handleAddSession}>+</button>
      </div>

      {sessions.map((session, index) => (
        <div key={index} className="session-item">
          <div className="session-header">
            {renamingIndex === index ? (
              <input
                className="rename-input"
                value={renameValue}
                autoFocus
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmRename(index);
                  if (e.key === "Escape") setRenamingIndex(null);
                }}
                onBlur={() => confirmRename(index)}
              />
            ) : (
              <h3 onClick={() => toggleSession(index)}>{session.name}</h3>
            )}
            <div className="session-actions">
              <button className="rename-btn" title="Renommer" onClick={() => startRename(index, session.name)}>✏️</button>
              <button className="delete-session" onClick={() => deleteSession(index)}>❌</button>
            </div>
          </div>

          {expandedIndex === index && (
            <div className="session-exercises">
              <div className="input-row" style={{ marginBottom: 10 }}>
                <input
                  type="text"
                  value={exerciseInputs[index] || ""}
                  onChange={(e) => setExerciseInputs((prev) => ({ ...prev, [index]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAddExercise(index)}
                  placeholder="Ajouter un exercice..."
                />
                <button className="add-button" onClick={() => handleAddExercise(index)}>+</button>
              </div>
              {session.exercises.length === 0 ? (
                <p className="no-exercises">Aucun exercice — ajoute en un !</p>
              ) : (
                <div className="exercise-tags">
                  {session.exercises.map((ex, i) => (
                    <span key={i} className="exercise-tag">
                      <span className="exercise-tag-arrows">
                        <button
                          className="tag-arrow-btn"
                          disabled={i === 0}
                          onClick={() => moveExercise(index, i, -1)}
                          title="Monter"
                        >↑</button>
                        <button
                          className="tag-arrow-btn"
                          disabled={i === session.exercises.length - 1}
                          onClick={() => moveExercise(index, i, 1)}
                          title="Descendre"
                        >↓</button>
                      </span>
                      <span className="exercise-tag-name">{ex.name}</span>
                      <button
                        className="exercise-tag-delete"
                        onClick={() => deleteExercise(index, i)}
                        title="Supprimer"
                      >×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
