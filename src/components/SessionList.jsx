import React, { useState, useRef, useEffect } from "react";

// ─── Muscles disponibles ───────────────────────────────────────────────────
const MUSCLES = [
  { id: "pectoraux",       label: "Pectoraux",         emoji: "🫁" },
  { id: "epaules",         label: "Épaules",            emoji: "🔵" },
  { id: "grand_dorsal",    label: "Grand dorsal",       emoji: "🔙" },
  { id: "trapezes",        label: "Trapèzes",           emoji: "🔝" },
  { id: "biceps",          label: "Biceps",             emoji: "💪" },
  { id: "triceps",         label: "Triceps",            emoji: "💪" },
  { id: "avant_bras",      label: "Avant-bras",         emoji: "🦾" },
  { id: "abdominaux",      label: "Abdominaux",         emoji: "🎯" },
  { id: "obliques",        label: "Obliques",           emoji: "↔️" },
  { id: "quadriceps",      label: "Quadriceps",         emoji: "🦵" },
  { id: "ischio",          label: "Ischio-jambiers",    emoji: "🦵" },
  { id: "fessiers",        label: "Fessiers",           emoji: "🍑" },
  { id: "mollets",         label: "Mollets",            emoji: "🦶" },
  { id: "adducteurs",      label: "Adducteurs",         emoji: "🔀" },
];

// ─── Exercices par muscle ──────────────────────────────────────────────────
const EXERCISES_BY_MUSCLE = {
  pectoraux:    ["Développé couché", "Développé incliné", "Développé décliné", "Écarté poulie", "Écarté haltères", "Pompes", "Dips pectoraux", "Pec deck machine"],
  epaules:      ["Développé militaire", "Développé Arnold", "Élévations latérales", "Élévations frontales", "Oiseau / Face pull", "Rowing menton", "Shrugs haltères", "Développé haltères assis"],
  grand_dorsal: ["Tractions", "Tirage poulie haute", "Rowing barre", "Rowing haltère", "Tirage horizontal câble", "Pull-over poulie", "Tirage barre en T", "Tractions prises neutres"],
  trapezes:     ["Shrugs barre", "Shrugs haltères", "Rowing menton", "Face pull", "Tirage nuque", "Élévations latérales arrière", "Rowing Yates", "Tirage basse poulie"],
  biceps:       ["Curl barre droite", "Curl haltères", "Curl marteau", "Curl concentré", "Curl poulie basse", "Curl barre EZ", "Curl incliné", "Curl Zottman"],
  triceps:      ["Dips triceps", "Extensions poulie haute", "Barre au front", "Kickback haltère", "Extensions haltère nuque", "Triceps corde poulie", "Close grip bench", "Dips banc"],
  avant_bras:   ["Curl poignets", "Curl poignets inversé", "Pronation / supination", "Farmer carry", "Pinch grip", "Enroulement de poignet"],
  abdominaux:   ["Crunch", "Planche", "Relevé de jambes", "Ab wheel", "Crunch à la poulie", "Sit-up", "Dragon flag", "Crunch inversé"],
  obliques:     ["Crunch oblique", "Russian twist", "Planche latérale", "Woodchop poulie", "Dumbbell side bend", "Bicycle crunch"],
  quadriceps:   ["Squat", "Presse à cuisses", "Fentes avant", "Leg extension", "Hack squat", "Goblet squat", "Fentes bulgares", "Sissy squat"],
  ischio:       ["Soulevé de terre jambes tendues", "Leg curl couché", "Leg curl assis", "Good morning", "Hip hinge", "Fentes arrière", "Soulevé de terre roumain"],
  fessiers:     ["Hip thrust", "Soulevé de terre sumo", "Fentes bulgares", "Abduction hanche machine", "Kick-back câble", "Squat sumo", "Step up", "Glute bridge"],
  mollets:      ["Mollets debout", "Mollets assis", "Leg press mollets", "Mollets unijambistes", "Saut à la corde", "Tibia raises"],
  adducteurs:   ["Adduction machine", "Sumo squat", "Fentes latérales", "Câble adduction", "Copenhagen plank", "Butterfly machine"],
};

// ─── Composant dropdown muscles ────────────────────────────────────────────
function MuscleSelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((m) => m !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const remaining = MUSCLES.filter((m) => !selected.includes(m.id));

  return (
    <div className="muscle-selector" ref={ref}>
      <div className="muscle-selector-label">Muscle(s) :</div>
      <div className="muscle-tags-row">
        {selected.map((id) => {
          const m = MUSCLES.find((x) => x.id === id);
          return (
            <span key={id} className="muscle-tag">
              {m?.label}
              <button
                className="muscle-tag-remove"
                onClick={() => toggle(id)}
                type="button"
              >
                ×
              </button>
            </span>
          );
        })}
        {remaining.length > 0 && (
          <div className="muscle-add-wrap">
            <button
              className="muscle-add-btn"
              onClick={() => setOpen((o) => !o)}
              type="button"
            >
              + Ajouter
            </button>
            {open && (
              <div className="muscle-dropdown">
                {remaining.map((m) => (
                  <button
                    key={m.id}
                    className="muscle-dropdown-item"
                    onClick={() => { toggle(m.id); setOpen(false); }}
                    type="button"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionList({
  sessions,
  addSession,
  deleteSession,
  addExercise,
  renameSession,
  deleteExercise,
  moveExercise,
  duplicateSession,
  setMusclesSession,
  onSelectSession,
}) {
  const [sessionInput, setSessionInput] = useState("");
  const [exerciseInputs, setExerciseInputs] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleAddSession = () => {
    const val = sessionInput.trim();
    if (!val || val.length > 30) {
      const el = document.querySelector(".session-input");
      el?.classList.add("input-error");
      setTimeout(() => el?.classList.remove("input-error"), 300);
      return;
    }
    addSession(val);
    setSessionInput("");
  };

  const handleAddExercise = (sessionIndex, name) => {
    const val =
      name !== undefined ? name : exerciseInputs[sessionIndex] || "";
    if (val.trim()) {
      addExercise(sessionIndex, val.trim());
      if (name === undefined)
        setExerciseInputs((prev) => ({ ...prev, [sessionIndex]: "" }));
    }
  };

  const confirmRename = (index) => {
    if (renameValue.trim() && renameValue.length <= 30) {
      renameSession(index, renameValue.trim());
    }
    setRenamingIndex(null);
  };

  const toggleExpand = (index) =>
    setExpandedIndex(expandedIndex === index ? null : index);

  return (
    <div className="session-list-page">
      <p className="session-page-title">Mes séances</p>

      {/* ── Création rapide ── */}
      <div className="input-row">
        <input
          type="text"
          className="session-input"
          value={sessionInput}
          onChange={(e) => {
            if (e.target.value.length <= 30) setSessionInput(e.target.value);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAddSession()}
          placeholder="Ex : Pecs épaules, Fessiers mollets…"
        />
        <button className="add-button" onClick={handleAddSession}>
          +
        </button>
      </div>

      {/* ── Liste des séances ── */}
      {sessions.map((session, index) => {
        const muscles = session.muscles || [];
        const isExpanded = expandedIndex === index;

        // Exercices suggérés = union de tous les muscles sélectionnés, sans doublons
        const suggestedExercises = [];
        const seen = new Set(session.exercises.map((e) => e.name));
        const muscleGroups = muscles
          .map((id) => ({
            id,
            label: MUSCLES.find((m) => m.id === id)?.label || id,
            exercises: (EXERCISES_BY_MUSCLE[id] || []).filter(
              (name) => !seen.has(name)
            ),
          }))
          .filter((g) => g.exercises.length > 0);

        return (
          <div key={index} className="session-item">
            {/* ── Header carte ── */}
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

                {/* Sélecteur muscles inline */}
                <MuscleSelector
                  selected={muscles}
                  onChange={(m) => setMusclesSession(index, m)}
                />
              </div>

              {/* Actions */}
              <div className="session-actions">
                <button
                  className="session-play-btn"
                  title="Démarrer"
                  onClick={() => onSelectSession(index)}
                >
                  ▶
                </button>
                <button
                  className="duplicate-btn"
                  title="Dupliquer"
                  onClick={() => duplicateSession(index)}
                >
                  ⧉
                </button>
                <button
                  className="rename-btn"
                  title="Renommer"
                  onClick={() => {
                    setRenamingIndex(index);
                    setRenameValue(session.name);
                  }}
                >
                  ✏️
                </button>
                <button
                  className="delete-session"
                  onClick={() => deleteSession(index)}
                >
                  ❌
                </button>
              </div>
            </div>

            {/* ── Accordéon exercices ── */}
            {isExpanded && (
              <div className="session-exercises">
                {/* Champ texte libre */}
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
                    placeholder="Exercice personnalisé…"
                  />
                  <button
                    className="add-button"
                    onClick={() => handleAddExercise(index)}
                  >
                    +
                  </button>
                </div>

                {/* Chips groupées par muscle */}
                {muscleGroups.length > 0 && (
                  <div className="biblio-groups">
                    {muscleGroups.map((g) => (
                      <div key={g.id} className="biblio-group">
                        <p className="biblio-group-label">{g.label}</p>
                        <div className="biblio-suggestions">
                          {g.exercises.map((name) => (
                            <button
                              key={name}
                              className="biblio-chip"
                              onClick={() => handleAddExercise(index, name)}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exercices ajoutés */}
                {session.exercises.length === 0 ? (
                  <p className="no-exercises">Aucun exercice — ajoute-en un !</p>
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
                            ↑
                          </button>
                          <button
                            className="tag-arrow-btn"
                            disabled={i === session.exercises.length - 1}
                            onClick={() => moveExercise(index, i, 1)}
                          >
                            ↓
                          </button>
                        </span>
                        <span className="exercise-tag-name">{ex.name}</span>
                        <button
                          className="exercise-tag-delete"
                          onClick={() => deleteExercise(index, i)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bouton expand */}
            <button
              className={`session-expand-btn ${isExpanded ? "open" : ""}`}
              onClick={() => toggleExpand(index)}
            >
              {isExpanded
                ? "▲ Réduire"
                : `▼ ${session.exercises.length} exercice${
                    session.exercises.length !== 1 ? "s" : ""
                  }`}
            </button>
          </div>
        );
      })}
    </div>
  );
}
