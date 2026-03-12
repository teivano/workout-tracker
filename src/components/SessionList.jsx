import React, { useState } from "react";

const CATEGORIES = [
  { value: "", label: "— Aucune —" },
  { value: "push",     label: "💪 Push",     color: "rgba(255,100,60,0.7)" },
  { value: "pull",     label: "🔵 Pull",     color: "rgba(60,140,255,0.7)" },
  { value: "legs",     label: "🦵 Legs",     color: "rgba(180,100,255,0.7)" },
  { value: "fullbody", label: "⚡ Full Body", color: "rgba(255,200,40,0.7)" },
  { value: "cardio",   label: "🏃 Cardio",   color: "rgba(40,200,140,0.7)" },
];

const BIBLIO = {
  push:     ["Développé couché", "Développé incliné", "Dips", "Pompes", "Élévations latérales", "Développé militaire", "Triceps poulie", "Extensions triceps"],
  pull:     ["Tractions", "Rowing barre", "Rowing haltère", "Tirage poulie haute", "Curl biceps", "Curl marteau", "Face pull", "Shrugs"],
  legs:     ["Squat", "Presse à cuisses", "Fentes", "Leg curl", "Leg extension", "Soulevé de terre", "Hip thrust", "Mollets debout"],
  fullbody: ["Squat", "Développé couché", "Rowing barre", "Soulevé de terre", "Tractions", "Dips", "Overhead press"],
  cardio:   ["Course à pied", "Vélo", "Rameur", "Corde à sauter", "Burpees", "Jumping jacks"],
  "": [],
};

const getCatStyle = (value) => {
  const c = CATEGORIES.find((c) => c.value === value);
  return c ? { background: c.color, color: "white" } : {};
};

export default function SessionList({ sessions, addSession, deleteSession, addExercise, renameSession, deleteExercise, moveExercise, duplicateSession, setCategorySession }) {
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

  const handleAddExercise = (sessionIndex, name) => {
    const val = name !== undefined ? name : (exerciseInputs[sessionIndex] || "");
    if (val.trim()) {
      addExercise(sessionIndex, val.trim());
      if (name === undefined) setExerciseInputs((prev) => ({ ...prev, [sessionIndex]: "" }));
    }
  };

  const confirmRename = (index) => {
    if (renameValue.trim() && renameValue.length <= 20 && regex.test(renameValue)) {
      renameSession(index, renameValue.trim());
    }
    setRenamingIndex(null);
  };

  const toggleSession = (index) => setExpandedIndex(expandedIndex === index ? null : index);

  return (
    <div className="session-list-page">
      <p className="session-page-title">Mes séances</p>

      <div className="input-row">
        <input
          type="text" className="session-input" value={sessionInput}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length <= 20 && /^[a-zA-Z\u00C0-\u00FF0-9\s]*$/.test(v)) setSessionInput(v);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAddSession()}
          placeholder="Nouvelle séance..."
        />
        <button className="add-button" onClick={handleAddSession}>+</button>
      </div>

      {sessions.map((session, index) => {
        const cat = session.category || "";
        const suggestions = BIBLIO[cat] || [];
        const added = new Set(session.exercises.map((e) => e.name));
        const remaining = suggestions.filter((s) => !added.has(s));

        return (
          <div key={index} className="session-item">
            <div className="session-header">
              {renamingIndex === index ? (
                <input className="rename-input" value={renameValue} autoFocus
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmRename(index); if (e.key === "Escape") setRenamingIndex(null); }}
                  onBlur={() => confirmRename(index)}
                />
              ) : (
                <h3 onClick={() => toggleSession(index)}>
                  {cat && <span className="session-category-badge" style={getCatStyle(cat)}>{CATEGORIES.find(c=>c.value===cat)?.label}</span>}
                  {session.name}
                </h3>
              )}
              <div className="session-actions">
                <button className="duplicate-btn" title="Dupliquer" onClick={() => duplicateSession(index)}>⧉</button>
                <button className="rename-btn" title="Renommer" onClick={() => { setRenamingIndex(index); setRenameValue(session.name); }}>✏️</button>
                <button className="delete-session" onClick={() => deleteSession(index)}>❌</button>
              </div>
            </div>

            {/* Sélecteur de catégorie */}
            {expandedIndex === index && (
              <div className="category-row">
                <label>Catégorie :</label>
                <select className="category-select" value={cat}
                  onChange={(e) => setCategorySession(index, e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            )}

            {expandedIndex === index && (
              <div className="session-exercises">
                <div className="input-row" style={{ marginBottom: 6 }}>
                  <input type="text" value={exerciseInputs[index] || ""}
                    onChange={(e) => setExerciseInputs((prev) => ({ ...prev, [index]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAddExercise(index)}
                    placeholder="Ajouter un exercice..."
                  />
                  <button className="add-button" onClick={() => handleAddExercise(index)}>+</button>
                </div>

                {/* Suggestions biblio */}
                {remaining.length > 0 && (
                  <div className="biblio-suggestions">
                    {remaining.map((name) => (
                      <button key={name} className="biblio-chip" onClick={() => handleAddExercise(index, name)}>{name}</button>
                    ))}
                  </div>
                )}

                {session.exercises.length === 0 ? (
                  <p className="no-exercises">Aucun exercice — ajoute en un !</p>
                ) : (
                  <div className="exercise-tags">
                    {session.exercises.map((ex, i) => (
                      <span key={i} className="exercise-tag">
                        <span className="exercise-tag-arrows">
                          <button className="tag-arrow-btn" disabled={i === 0} onClick={() => moveExercise(index, i, -1)}>↑</button>
                          <button className="tag-arrow-btn" disabled={i === session.exercises.length - 1} onClick={() => moveExercise(index, i, 1)}>↓</button>
                        </span>
                        <span className="exercise-tag-name">{ex.name}</span>
                        <button className="exercise-tag-delete" onClick={() => deleteExercise(index, i)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
