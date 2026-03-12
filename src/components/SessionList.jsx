import React, { useState } from "react";

const CATEGORIES = [
  { value: "",        label: "\u2014 Aucune \u2014",  color: null },
  { value: "push",     label: "\ud83d\udcaa Push",      color: "rgba(255,100,60,0.75)" },
  { value: "pull",     label: "\ud83d\udd35 Pull",      color: "rgba(60,140,255,0.75)" },
  { value: "legs",     label: "\ud83e\udb35 Legs",      color: "rgba(180,100,255,0.75)" },
  { value: "fullbody", label: "\u26a1 Full Body",  color: "rgba(255,200,40,0.75)" },
  { value: "cardio",   label: "\ud83c\udfc3 Cardio",    color: "rgba(40,200,140,0.75)" },
];

const BIBLIO = {
  push:     ["D\u00e9velopp\u00e9 couch\u00e9", "D\u00e9velopp\u00e9 inclin\u00e9", "Dips", "Pompes", "\u00c9l\u00e9vations lat\u00e9rales", "D\u00e9velopp\u00e9 militaire", "Triceps poulie", "Extensions triceps"],
  pull:     ["Tractions", "Rowing barre", "Rowing halt\u00e8re", "Tirage poulie haute", "Curl biceps", "Curl marteau", "Face pull", "Shrugs"],
  legs:     ["Squat", "Presse \u00e0 cuisses", "Fentes", "Leg curl", "Leg extension", "Soulev\u00e9 de terre", "Hip thrust", "Mollets debout"],
  fullbody: ["Squat", "D\u00e9velopp\u00e9 couch\u00e9", "Rowing barre", "Soulev\u00e9 de terre", "Tractions", "Dips", "Overhead press"],
  cardio:   ["Course \u00e0 pied", "V\u00e9lo", "Rameur", "Corde \u00e0 sauter", "Burpees", "Jumping jacks"],
  "": [],
};

const getCat = (value) => CATEGORIES.find((c) => c.value === value);

export default function SessionList({
  sessions, addSession, deleteSession, addExercise,
  renameSession, deleteExercise, moveExercise,
  duplicateSession, setCategorySession, onSelectSession,
}) {
  const [sessionInput, setSessionInput] = useState("");
  const [exerciseInputs, setExerciseInputs] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const regex = /^[a-zA-Z\u00C0-\u00FF0-9\s]+$/;

  const handleAddSession = () => {
    if (!sessionInput.trim() || sessionInput.length > 20 || !regex.test(sessionInput)) {
      const el = document.querySelector(".session-input");
      el?.classList.add("input-error");
      setTimeout(() => el?.classList.remove("input-error"), 300);
      return;
    }
    addSession(sessionInput.trim());
    setSessionInput("");
  };

  const handleAddExercise = (sessionIndex, name) => {
    const val = name !== undefined ? name : (exerciseInputs[sessionIndex] || "");
    if (val.trim()) {
      addExercise(sessionIndex, val.trim());
      if (name === undefined)
        setExerciseInputs((prev) => ({ ...prev, [sessionIndex]: "" }));
    }
  };

  const confirmRename = (index) => {
    if (renameValue.trim() && renameValue.length <= 20 && regex.test(renameValue)) {
      renameSession(index, renameValue.trim());
    }
    setRenamingIndex(null);
  };

  const toggleExpand = (index) =>
    setExpandedIndex(expandedIndex === index ? null : index);

  return (
    <div className="session-list-page">
      <p className="session-page-title">Mes s\u00e9ances</p>

      {/* ── Cr\u00e9ation rapide ── */}
      <div className="input-row">
        <input
          type="text"
          className="session-input"
          value={sessionInput}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length <= 20 && /^[a-zA-Z\u00C0-\u00FF0-9\s]*$/.test(v))
              setSessionInput(v);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAddSession()}
          placeholder="Nouvelle s\u00e9ance..."
        />
        <button className="add-button" onClick={handleAddSession}>+</button>
      </div>

      {/* ── Liste des s\u00e9ances ── */}
      {sessions.map((session, index) => {
        const cat = session.category || "";
        const catMeta = getCat(cat);
        const suggestions = BIBLIO[cat] || [];
        const added = new Set(session.exercises.map((e) => e.name));
        const remaining = suggestions.filter((s) => !added.has(s));
        const isExpanded = expandedIndex === index;

        return (
          <div key={index} className="session-item">
            {/* ── En-t\u00eate carte ── */}
            <div className="session-header">
              <div className="session-header-left">
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
                  <h3 onClick={() => toggleExpand(index)}>{session.name}</h3>
                )}

                {/* Badge cat\u00e9gorie — cliquable pour cycler */}
                <div className="session-cat-row">
                  {CATEGORIES.filter((c) => c.value !== "").map((c) => (
                    <button
                      key={c.value}
                      className={`cat-chip ${
                        cat === c.value ? "cat-chip-active" : ""
                      }`}
                      style={
                        cat === c.value && c.color
                          ? { background: c.color, borderColor: c.color }
                          : {}
                      }
                      onClick={() =>
                        setCategorySession(index, cat === c.value ? "" : c.value)
                      }
                      title={c.label}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="session-actions">
                <button
                  className="session-play-btn"
                  title="D\u00e9marrer"
                  onClick={() => onSelectSession(index)}
                >
                  \u25b6
                </button>
                <button
                  className="duplicate-btn"
                  title="Dupliquer"
                  onClick={() => duplicateSession(index)}
                >
                  \u29c9
                </button>
                <button
                  className="rename-btn"
                  title="Renommer"
                  onClick={() => { setRenamingIndex(index); setRenameValue(session.name); }}
                >
                  \u270f\ufe0f
                </button>
                <button
                  className="delete-session"
                  onClick={() => deleteSession(index)}
                >
                  \u274c
                </button>
              </div>
            </div>

            {/* ── Exercices (accordéon) ── */}
            {isExpanded && (
              <div className="session-exercises">
                <div className="input-row" style={{ marginBottom: 6 }}>
                  <input
                    type="text"
                    value={exerciseInputs[index] || ""}
                    onChange={(e) =>
                      setExerciseInputs((prev) => ({
                        ...prev,
                        [index]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddExercise(index)
                    }
                    placeholder="Ajouter un exercice..."
                  />
                  <button
                    className="add-button"
                    onClick={() => handleAddExercise(index)}
                  >
                    +
                  </button>
                </div>

                {remaining.length > 0 && (
                  <div className="biblio-suggestions">
                    {remaining.map((name) => (
                      <button
                        key={name}
                        className="biblio-chip"
                        onClick={() => handleAddExercise(index, name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}

                {session.exercises.length === 0 ? (
                  <p className="no-exercises">
                    Aucun exercice \u2014 ajoute-en un !
                  </p>
                ) : (
                  <div className="exercise-tags">
                    {session.exercises.map((ex, i) => (
                      <span key={i} className="exercise-tag">
                        <span className="exercise-tag-arrows">
                          <button
                            className="tag-arrow-btn"
                            disabled={i === 0}
                            onClick={() => moveExercise(index, i, -1)}
                          >
                            \u2191
                          </button>
                          <button
                            className="tag-arrow-btn"
                            disabled={i === session.exercises.length - 1}
                            onClick={() => moveExercise(index, i, 1)}
                          >
                            \u2193
                          </button>
                        </span>
                        <span className="exercise-tag-name">{ex.name}</span>
                        <button
                          className="exercise-tag-delete"
                          onClick={() => deleteExercise(index, i)}
                        >
                          \u00d7
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chevron expand */}
            <button
              className={`session-expand-btn ${isExpanded ? "open" : ""}`}
              onClick={() => toggleExpand(index)}
              title={isExpanded ? "R\u00e9duire" : "Voir les exercices"}
            >
              <span>{isExpanded ? "\u25b2" : `\u25bc ${session.exercises.length} exercice${
                session.exercises.length !== 1 ? "s" : ""
              }`}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
