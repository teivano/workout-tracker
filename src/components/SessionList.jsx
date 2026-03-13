// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
import React, { useState, useEffect, useRef } from "react";

// Muscles triés par ordre alphabétique (localeCompare fr)
const MUSCLES = [
  { id: "abdominaux",   label: "Abdominaux" },
  { id: "adducteurs",   label: "Adducteurs" },
  { id: "avant_bras",   label: "Avant-bras" },
  { id: "biceps",       label: "Biceps" },
  { id: "epaules",      label: "Épaules" },
  { id: "fessiers",     label: "Fessiers" },
  { id: "grand_dorsal", label: "Grand dorsal" },
  { id: "ischio",       label: "Ischio-jambiers" },
  { id: "mollets",      label: "Mollets" },
  { id: "obliques",     label: "Obliques" },
  { id: "pectoraux",    label: "Pectoraux" },
  { id: "quadriceps",   label: "Quadriceps" },
  { id: "trapezes",     label: "Trapèzes" },
  { id: "triceps",      label: "Triceps" },
];

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

// Dropdown muscles : se ferme après chaque sélection (recliquer sur "+ Ajouter" pour en ajouter un autre)
function MuscleSelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({});
  const btnRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  const handleOpen = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const approxDropH = Math.min(220, MUSCLES.length * 38);
    const pos = spaceBelow >= approxDropH
      ? { top: rect.bottom + 4, left: rect.left }
      : { bottom: window.innerHeight - rect.top + 4, left: rect.left };
    setDropPos({ position: "fixed", minWidth: 170, zIndex: 3000, ...pos });
    setOpen((o) => !o);
  };

  // Ferme le dropdown après sélection
  const toggle = (id) => {
    onChange(selected.includes(id)
      ? selected.filter((m) => m !== id)
      : [...selected, id]
    );
    setOpen(false); // ferme après chaque sélection
  };

  const remaining = MUSCLES.filter((m) => !selected.includes(m.id));

  return (
    <div className="muscle-selector">
      <div className="muscle-selector-label">Muscle(s) :</div>
      <div className="muscle-tags-row">
        {selected.map((id) => {
          const m = MUSCLES.find((x) => x.id === id);
          return (
            <span key={id} className="muscle-tag">
              {m?.label}
              <button
                className="muscle-tag-remove"
                onPointerDown={(e) => { e.stopPropagation(); }}
                onClick={() => onChange(selected.filter((x) => x !== id))}
                type="button"
              >×</button>
            </span>
          );
        })}
        {remaining.length > 0 && (
          <>
            <button ref={btnRef} className="muscle-add-btn" onClick={handleOpen} type="button">
              + Ajouter
            </button>
            {open && (
              <div ref={dropRef} className="muscle-dropdown" style={dropPos}>
                {remaining.map((m) => (
                  <button
                    key={m.id}
                    className="muscle-dropdown-item"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => toggle(m.id)}
                    type="button"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SessionList({
  sessions, addSession, deleteSession, addExercise,
  renameSession, deleteExercise, moveExercise,
  duplicateSession, setMusclesSession, onSelectSession,
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
    const val = name !== undefined ? name : exerciseInputs[sessionIndex] || "";
    if (val.trim()) {
      addExercise(sessionIndex, val.trim());
      if (name === undefined)
        setExerciseInputs((prev) => ({ ...prev, [sessionIndex]: "" }));
    }
  };

  const confirmRename = (index) => {
    if (renameValue.trim() && renameValue.length <= 30)
      renameSession(index, renameValue.trim());
    setRenamingIndex(null);
  };

  const toggleExpand = (index) =>
    setExpandedIndex(expandedIndex === index ? null : index);

  return (
    <div className="session-list-page">
      <p className="session-page-title">Mes séances</p>

      <div className="input-row">
        <input
          type="text"
          className="session-input"
          value={sessionInput}
          onChange={(e) => { if (e.target.value.length <= 30) setSessionInput(e.target.value); }}
          onKeyDown={(e) => e.key === "Enter" && handleAddSession()}
          placeholder="Ex : Pecs épaules, Fessiers mollets…"
        />
        <button className="add-button" onClick={handleAddSession}>+</button>
      </div>

      {sessions.map((session, index) => {
        const muscles = session.muscles || [];
        const isExpanded = expandedIndex === index;
        const seen = new Set(session.exercises.map((e) => e.name));
        const muscleGroups = muscles
          .map((id) => ({
            id,
            label: MUSCLES.find((m) => m.id === id)?.label || id,
            exercises: (EXERCISES_BY_MUSCLE[id] || []).filter((n) => !seen.has(n)),
          }))
          .filter((g) => g.exercises.length > 0);

        const exCount = session.exercises.length;
        const exCountDanger = exCount === 0;

        return (
          <div key={index} className="session-item">
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
                <MuscleSelector
                  selected={muscles}
                  onChange={(m) => setMusclesSession(index, m)}
                />
              </div>
              <div className="session-actions">
                <button className="duplicate-btn" onClick={() => duplicateSession(index)}>⧉</button>
                <button className="rename-btn" onClick={() => { setRenamingIndex(index); setRenameValue(session.name); }}>✏️</button>
                <button className="delete-session" onClick={() => deleteSession(index)}>❌</button>
              </div>
            </div>

            {isExpanded && (
              <div className="session-exercises">
                <div className="input-row" style={{ marginBottom: 6 }}>
                  <input
                    type="text"
                    value={exerciseInputs[index] || ""}
                    onChange={(e) => setExerciseInputs((prev) => ({ ...prev, [index]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAddExercise(index)}
                    placeholder="Exercice personnalisé…"
                  />
                  <button className="add-button" onClick={() => handleAddExercise(index)}>+</button>
                </div>

                {muscleGroups.length > 0 && (
                  <div className="biblio-groups">
                    {muscleGroups.map((g) => (
                      <div key={g.id} className="biblio-group">
                        <p className="biblio-group-label">{g.label}</p>
                        <div className="biblio-suggestions">
                          {g.exercises.map((name) => (
                            <button key={name} className="biblio-chip" onClick={() => handleAddExercise(index, name)}>{name}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {session.exercises.length === 0 ? (
                  <p className="no-exercises">Aucun exercice — ajoute-en un !</p>
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

            <button
              className={`session-expand-btn ${isExpanded ? "open" : ""}`}
              onClick={() => toggleExpand(index)}
            >
              {isExpanded
                ? "▲ Réduire"
                : <>▼ <span className={exCountDanger ? "expand-count-danger" : ""}>{exCount} exercice{exCount !== 1 ? "s" : ""}</span></>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
