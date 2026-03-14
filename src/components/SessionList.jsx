// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
import React, { useState, useEffect, useRef } from "react";

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
  { id: "autres",       label: "Autres" },
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
  autres:       [],
};

function DumbbellEmptySVG() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.35 }}>
      <rect x="4" y="22" width="8" height="12" rx="3" fill="currentColor" />
      <rect x="44" y="22" width="8" height="12" rx="3" fill="currentColor" />
      <rect x="10" y="19" width="6" height="18" rx="2" fill="currentColor" />
      <rect x="40" y="19" width="6" height="18" rx="2" fill="currentColor" />
      <rect x="16" y="26" width="24" height="4" rx="2" fill="currentColor" />
    </svg>
  );
}

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

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((m) => m !== id) : [...selected, id]);
    setOpen(false);
  };

  const remaining = MUSCLES.filter((m) => !selected.includes(m.id));

  return (
    <div className="muscle-selector">
      <div className="muscle-selector-label">Muscles ciblés</div>
      <div className="muscle-tags-row">
        {selected.map((id) => {
          const m = MUSCLES.find((x) => x.id === id);
          return (
            <span key={id} className="muscle-tag">
              {m?.label}
              <button
                className="muscle-tag-remove"
                onPointerDown={(e) => e.stopPropagation()}
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
                {remaining.map((m, i) => (
                  <button
                    key={m.id}
                    className={`muscle-dropdown-item${m.id === "autres" ? " muscle-dropdown-item-autres" : ""}`}
                    style={m.id === "autres" && i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 4 } : {}}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => toggle(m.id)}
                    type="button"
                  >{m.label}</button>
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
  const [showInput, setShowInput] = useState(false);
  const [exerciseInputs, setExerciseInputs] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [newSessionIndex, setNewSessionIndex] = useState(null);
  const [savedIndex, setSavedIndex] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (showInput) setTimeout(() => inputRef.current?.focus(), 60);
  }, [showInput]);

  const handleAddSession = () => {
    const val = sessionInput.trim();
    if (!val || val.length > 30) {
      inputRef.current?.classList.add("input-error");
      setTimeout(() => inputRef.current?.classList.remove("input-error"), 300);
      return;
    }
    addSession(val);
    setSessionInput("");
    setShowInput(false);
    setExpandedIndex(0);
    setNewSessionIndex(0);
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

  const toggleExpand = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
      setNewSessionIndex(null);
    } else {
      const muscles = sessions[index]?.muscles || [];
      if (muscles.length === 0) return;
      setExpandedIndex(index);
    }
  };

  const handleMusclesChange = (index, muscles) => {
    setMusclesSession(index, muscles);
    if (muscles.length > 0 && sessions[index]?.exercises?.length === 0) {
      setExpandedIndex(index);
    }
  };

  const handleSaveSession = (index) => {
    setExpandedIndex(null);
    setNewSessionIndex(null);
    setSavedIndex(index);
    setTimeout(() => setSavedIndex(null), 1800);
  };

  if (sessions.length === 0 && !showInput) {
    return (
      <div className="session-list-page">
        <div className="empty-state" style={{ height: "55vh" }}>
          <DumbbellEmptySVG />
          <p>Aucune séance créée</p>
          <small>Commence par créer ta première séance d’entraînement</small>
          <button className="session-create-btn" onClick={() => setShowInput(true)}>
            + Nouvelle séance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="session-list-page">
      <p className="session-page-title">Mes séances</p>

      <div className="session-create-row">
        {showInput ? (
          <div className="session-create-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className="session-input"
              value={sessionInput}
              onChange={(e) => { if (e.target.value.length <= 30) setSessionInput(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSession();
                if (e.key === "Escape") { setShowInput(false); setSessionInput(""); }
              }}
              placeholder="Nom de la séance…"
            />
            <button className="session-create-btn session-create-btn-confirm" onClick={handleAddSession}>
              Créer
            </button>
            <button className="session-create-btn-cancel" onClick={() => { setShowInput(false); setSessionInput(""); }}>
              Annuler
            </button>
          </div>
        ) : (
          <button className="session-create-btn" onClick={() => setShowInput(true)}>
            + Nouvelle séance
          </button>
        )}
      </div>

      {sessions.map((session, index) => {
        const muscles = session.muscles || [];
        const isExpanded = expandedIndex === index;
        const isNew = newSessionIndex === index;
        const isSaved = savedIndex === index;
        const hasMuscles = muscles.length > 0;
        const seen = new Set(session.exercises.map((e) => e.name));
        const muscleGroups = muscles
          .filter((id) => id !== "autres")
          .map((id) => ({
            id,
            label: MUSCLES.find((m) => m.id === id)?.label || id,
            exercises: (EXERCISES_BY_MUSCLE[id] || []).filter((n) => !seen.has(n)),
          }))
          .filter((g) => g.exercises.length > 0);

        const exCount = session.exercises.length;
        const exCountDanger = exCount === 0;

        return (
          <div key={index} className={`session-item${isSaved ? " session-item-saved" : ""}`}>
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
                  onChange={(m) => handleMusclesChange(index, m)}
                />
              </div>
              <div className="session-actions">
                <button className="duplicate-btn" title="Dupliquer" onClick={() => duplicateSession(index)}>&#x29C7;</button>
                <button className="rename-btn" title="Renommer" onClick={() => { setRenamingIndex(index); setRenameValue(session.name); }}>&#x270F;&#xFE0F;</button>
                <button className="delete-session" title="Supprimer" onClick={() => deleteSession(index)}>&#x274C;</button>
              </div>
            </div>

            {isExpanded && (
              <div className="session-exercises">
                {exCount === 0 && hasMuscles && (
                  <p className="session-exercises-prompt">
                    Ajoute des exercices depuis les suggestions ci-dessous ↓
                  </p>
                )}

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

                {exCount > 0 && (
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

                <button
                  className={`session-save-btn${isNew ? " session-save-btn-new" : ""}`}
                  onClick={() => handleSaveSession(index)}
                >
                  {isNew ? "✓ Créer la séance" : "✓ Enregistrer"}
                </button>
              </div>
            )}

            <button
              className={`session-expand-btn ${isExpanded ? "open" : ""}${!hasMuscles ? " session-expand-btn-hint" : ""}`}
              onClick={() => toggleExpand(index)}
            >
              {isSaved ? (
                <span className="expand-saved-label">✓ Enregistrée</span>
              ) : !hasMuscles ? (
                <span className="expand-hint-label">↑ Sélectionne d’abord des muscles</span>
              ) : isExpanded ? (
                "▲ Réduire"
              ) : (
                <>{"\u25bc "}<span className={exCountDanger ? "expand-count-danger" : ""}>{exCount} exercice{exCount !== 1 ? "s" : ""}</span></>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
// Sync
