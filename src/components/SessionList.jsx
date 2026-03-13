// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
import React, { useState, useEffect, useRef } from "react";

const MUSCLES = [
  { id: "abdominaux",   label: "Abdominaux" },
  { id: "adducteurs",   label: "Adducteurs" },
  { id: "avant_bras",   label: "Avant-bras" },
  { id: "biceps",       label: "Biceps" },
  { id: "epaules",      label: "\u00c9paules" },
  { id: "fessiers",     label: "Fessiers" },
  { id: "grand_dorsal", label: "Grand dorsal" },
  { id: "ischio",       label: "Ischio-jambiers" },
  { id: "mollets",      label: "Mollets" },
  { id: "obliques",     label: "Obliques" },
  { id: "pectoraux",    label: "Pectoraux" },
  { id: "quadriceps",   label: "Quadriceps" },
  { id: "trapezes",     label: "Trap\u00e8zes" },
  { id: "triceps",      label: "Triceps" },
];

const EXERCISES_BY_MUSCLE = {
  pectoraux:    ["D\u00e9velopp\u00e9 couch\u00e9", "D\u00e9velopp\u00e9 inclin\u00e9", "D\u00e9velopp\u00e9 d\u00e9clin\u00e9", "\u00c9cart\u00e9 poulie", "\u00c9cart\u00e9 halt\u00e8res", "Pompes", "Dips pectoraux", "Pec deck machine"],
  epaules:      ["D\u00e9velopp\u00e9 militaire", "D\u00e9velopp\u00e9 Arnold", "\u00c9l\u00e9vations lat\u00e9rales", "\u00c9l\u00e9vations frontales", "Oiseau / Face pull", "Rowing menton", "Shrugs halt\u00e8res", "D\u00e9velopp\u00e9 halt\u00e8res assis"],
  grand_dorsal: ["Tractions", "Tirage poulie haute", "Rowing barre", "Rowing halt\u00e8re", "Tirage horizontal c\u00e2ble", "Pull-over poulie", "Tirage barre en T", "Tractions prises neutres"],
  trapezes:     ["Shrugs barre", "Shrugs halt\u00e8res", "Rowing menton", "Face pull", "Tirage nuque", "\u00c9l\u00e9vations lat\u00e9rales arri\u00e8re", "Rowing Yates", "Tirage basse poulie"],
  biceps:       ["Curl barre droite", "Curl halt\u00e8res", "Curl marteau", "Curl concentr\u00e9", "Curl poulie basse", "Curl barre EZ", "Curl inclin\u00e9", "Curl Zottman"],
  triceps:      ["Dips triceps", "Extensions poulie haute", "Barre au front", "Kickback halt\u00e8re", "Extensions halt\u00e8re nuque", "Triceps corde poulie", "Close grip bench", "Dips banc"],
  avant_bras:   ["Curl poignets", "Curl poignets invers\u00e9", "Pronation / supination", "Farmer carry", "Pinch grip", "Enroulement de poignet"],
  abdominaux:   ["Crunch", "Planche", "Relev\u00e9 de jambes", "Ab wheel", "Crunch \u00e0 la poulie", "Sit-up", "Dragon flag", "Crunch invers\u00e9"],
  obliques:     ["Crunch oblique", "Russian twist", "Planche lat\u00e9rale", "Woodchop poulie", "Dumbbell side bend", "Bicycle crunch"],
  quadriceps:   ["Squat", "Presse \u00e0 cuisses", "Fentes avant", "Leg extension", "Hack squat", "Goblet squat", "Fentes bulgares", "Sissy squat"],
  ischio:       ["Soulev\u00e9 de terre jambes tendues", "Leg curl couch\u00e9", "Leg curl assis", "Good morning", "Hip hinge", "Fentes arri\u00e8re", "Soulev\u00e9 de terre roumain"],
  fessiers:     ["Hip thrust", "Soulev\u00e9 de terre sumo", "Fentes bulgares", "Abduction hanche machine", "Kick-back c\u00e2ble", "Squat sumo", "Step up", "Glute bridge"],
  mollets:      ["Mollets debout", "Mollets assis", "Leg press mollets", "Mollets unijambistes", "Saut \u00e0 la corde", "Tibia raises"],
  adducteurs:   ["Adduction machine", "Sumo squat", "Fentes lat\u00e9rales", "C\u00e2ble adduction", "Copenhagen plank", "Butterfly machine"],
};

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
    onChange(selected.includes(id)
      ? selected.filter((m) => m !== id)
      : [...selected, id]
    );
    setOpen(false);
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
              >\u00d7</button>
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
  // Index de la s\u00e9ance nouvellement cr\u00e9\u00e9e (pour diff\u00e9rencier le btn)
  const [newSessionIndex, setNewSessionIndex] = useState(null);
  // Feedback visuel apr\u00e8s validation
  const [savedIndex, setSavedIndex] = useState(null);

  const handleAddSession = () => {
    const val = sessionInput.trim();
    if (!val || val.length > 30) {
      const el = document.querySelector(".session-input");
      el?.classList.add("input-error");
      setTimeout(() => el?.classList.remove("input-error"), 300);
      return;
    }
    addSession(val);
    // La nouvelle s\u00e9ance arrive en index 0 (prepend dans App.jsx)
    setExpandedIndex(0);
    setNewSessionIndex(0);
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

  const toggleExpand = (index) => {
    // Fermer une carte qui n'est pas en mode "nouvelle" efface le flag new
    if (expandedIndex === index) {
      setExpandedIndex(null);
      setNewSessionIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  // Validation : ferme la carte, flash de confirmation bref
  const handleSaveSession = (index) => {
    setExpandedIndex(null);
    setNewSessionIndex(null);
    setSavedIndex(index);
    setTimeout(() => setSavedIndex(null), 1800);
  };

  // Quand sessions change (ajout/suppression), recalibrer les index si n\u00e9cessaire
  useEffect(() => {
    // Si on ajoute une s\u00e9ance elle arrive en 0, les autres d\u00e9calent
    // newSessionIndex = 0 est d\u00e9j\u00e0 correct car addSession prepend
  }, [sessions.length]);

  return (
    <div className="session-list-page">
      <p className="session-page-title">Mes s\u00e9ances</p>

      <div className="input-row">
        <input
          type="text"
          className="session-input"
          value={sessionInput}
          onChange={(e) => { if (e.target.value.length <= 30) setSessionInput(e.target.value); }}
          onKeyDown={(e) => e.key === "Enter" && handleAddSession()}
          placeholder="Ex\u00a0: Pecs \u00e9paules, Fessiers mollets\u2026"
        />
        <button className="add-button" onClick={handleAddSession}>+</button>
      </div>

      {sessions.map((session, index) => {
        const muscles = session.muscles || [];
        const isExpanded = expandedIndex === index;
        const isNew = newSessionIndex === index;
        const isSaved = savedIndex === index;
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
                  onChange={(m) => setMusclesSession(index, m)}
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
                <div className="input-row" style={{ marginBottom: 6 }}>
                  <input
                    type="text"
                    value={exerciseInputs[index] || ""}
                    onChange={(e) => setExerciseInputs((prev) => ({ ...prev, [index]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAddExercise(index)}
                    placeholder="Exercice personnalis\u00e9\u2026"
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
                  <p className="no-exercises">Aucun exercice \u2014 ajoute-en un\u00a0!</p>
                ) : (
                  <div className="exercise-tags">
                    {session.exercises.map((ex, i) => (
                      <span key={i} className="exercise-tag">
                        <span className="exercise-tag-arrows">
                          <button className="tag-arrow-btn" disabled={i === 0} onClick={() => moveExercise(index, i, -1)}>\u2191</button>
                          <button className="tag-arrow-btn" disabled={i === session.exercises.length - 1} onClick={() => moveExercise(index, i, 1)}>\u2193</button>
                        </span>
                        <span className="exercise-tag-name">{ex.name}</span>
                        <button className="exercise-tag-delete" onClick={() => deleteExercise(index, i)}>\u00d7</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Bouton de validation en bas de la liste */}
                <button
                  className={`session-save-btn${isNew ? " session-save-btn-new" : ""}`}
                  onClick={() => handleSaveSession(index)}
                >
                  {isNew ? "\u2713 Cr\u00e9er la s\u00e9ance" : "\u2713 Enregistrer"}
                </button>
              </div>
            )}

            <button
              className={`session-expand-btn ${isExpanded ? "open" : ""}`}
              onClick={() => toggleExpand(index)}
            >
              {isSaved
                ? <span className="expand-saved-label">\u2713 Enregistr\u00e9e</span>
                : isExpanded
                ? "\u25b2 R\u00e9duire"
                : <>{"\u25bc "}<span className={exCountDanger ? "expand-count-danger" : ""}>{exCount} exercice{exCount !== 1 ? "s" : ""}</span></>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
