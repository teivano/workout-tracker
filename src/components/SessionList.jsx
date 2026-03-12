import React, { useState } from "react";

export default function SessionList({ sessions, addSession, deleteSession, addExercise }) {
  const [sessionInput, setSessionInput] = useState("");
  const [exerciseInput, setExerciseInput] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleAddSession = () => {
    const regex = /^[a-zA-ZÀ-ÿ0-9\s]+$/;
    if (!sessionInput.trim() || sessionInput.length > 20 || !regex.test(sessionInput)) {
      const inputField = document.querySelector(".session-input");
      inputField.classList.add("input-error");
      setTimeout(() => inputField.classList.remove("input-error"), 300);
      return;
    }
    addSession(sessionInput);
    setSessionInput("");
  };

  const handleAddExercise = (sessionIndex) => {
    if (exerciseInput.trim() && sessionIndex !== null) {
      addExercise(sessionIndex, exerciseInput);
      setExerciseInput("");
    }
  };

  const toggleSession = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div>
      <h2>Liste des séances</h2>

      <input
        type="text"
        className="session-input"
        value={sessionInput}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= 20 && /^[a-zA-ZÀ-ÿ0-9\s]*$/.test(value)) {
            setSessionInput(value);
          }
        }}
        onKeyDown={(e) => e.key === "Enter" && handleAddSession()}
        placeholder="Ajouter une séance..."
      />
      <button className="add-button" onClick={handleAddSession}>+</button>

      {sessions.map((session, index) => (
        <div key={index} className="session-item">
          <div className="session-header">
            <h3 onClick={() => toggleSession(index)}>✏️ {session.name}</h3>
            <button
              className="delete-session"
              onClick={() => deleteSession(index)}
            >❌</button>
          </div>

          {expandedIndex === index && (
            <div className="exercise-list">
              <h4>Ajouter un exercice :</h4>
              <input
                type="text"
                value={exerciseInput}
                onChange={(e) => setExerciseInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddExercise(index)}
                placeholder="Nom de l'exercice"
              />
              <button className="add-button" onClick={() => handleAddExercise(index)}>+</button>

              <ul>
                {session.exercises.map((exercise, exIndex) => (
                  <li key={exIndex}>{exercise.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
