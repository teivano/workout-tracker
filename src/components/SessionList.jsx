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

// Illustration Pro : Dossier + Force
function IllustrationSessions() {
  return (
    <div className="empty-illustration">
      <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 25C10 22.2386 12.2386 20 15 20H35L42 28H85C87.7614 28 90 30.2386 90 33V65C90 67.7614 87.7614 70 85 70H15C12.2386 70 10 67.7614 10 65V25Z" stroke="currentColor" strokeWidth="2.5"/>
        <circle cx="50" cy="49" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/>
        <path d="M47 49L50 46L53 49M50 46V53" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
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
  // États pour la création progressive
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftMuscles, setDraftMuscles] = useState([]);
  const [draftExercises, setDraftExercises] = useState([]);
  const [draftExInput, setDraftExInput] = useState("");

  const [exerciseInputs, setExerciseInputs] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [savedIndex, setSavedIndex] = useState(null);
  
  const draftInputRef = useRef(null);
  const draftCardRef = useRef(null);

  // Auto-focus et Scroll lors de la création
  useEffect(() => {
    if (isCreating) {
      setTimeout(() => {
        draftInputRef.current?.focus();
        draftCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isCreating]);

  const handleStartCreation = () => {
    setIsCreating(true);
    setDraftName("");
    setDraftMuscles([]);
    setDraftExercises([]);
  };

  const handleCancelCreation = () => {
    setIsCreating(false);
  };

  const handleConfirmCreation = () => {
    if (!draftName.trim()) return;
    // Ajout de la séance via le parent
    addSession(draftName.trim());
    
    // Application immédiate des muscles et exercices au nouvel index 0
    setTimeout(() => {
      if (draftMuscles.length > 0) setMusclesSession(0, draftMuscles);
      draftExercises.forEach(ex => addExercise(0, ex));
      setSavedIndex(0);
      setTimeout(() => setSavedIndex(null), 1800);
    }, 50);

    setIsCreating(false);
  };

  const handleAddDraftExercise = (name) => {
    const val = name || draftExInput;
    if (val.trim()) {
      setDraftExercises(prev => [...prev, val.trim()]);
      setDraftExInput("");
    }
  };

  const confirmRename = (index) => {
    if (renameValue.trim() && renameValue.length <= 30)
      renameSession(index, renameValue.trim());
    setRenamingIndex(null);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (sessions.length === 0 && !isCreating) {
    return (
      <div className="session-list-page">
        <div className="empty-state-rich">
          <IllustrationSessions />
          <h3>Organise ton entraînement</h3>
          <p>Crée tes propres séances personnalisées pour suivre tes progrès.</p>
          <button className="session-create-btn" style={{marginTop: '20px'}} onClick={handleStartCreation}>
            + Nouvelle séance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="session-list-page">
      <p className="session-page-title">Mes séances</p>

      {!isCreating && (
        <div className="session-create-row">
          <button className="session-create-btn" onClick={handleStartCreation}>
            + Nouvelle séance
          </button>
        </div>
      )}

      {/* CARTE DE CRÉATION (DRAFT) */}
      {isCreating && (
<div className="session-item session-item-draft" ref={draftCardRef}>          <div className="session-header">
            <div className="session-header-left">
              <input
                ref={draftInputRef}
                className="rename-input"
                style={{ width: '100%', marginBottom: '8px' }}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Nom de la séance..."
              />
              
              {/* Le MuscleSelector s'affiche dès le début, mais les options d'exercices restent fermées */}
              <MuscleSelector
                selected={draftMuscles}
                onChange={setDraftMuscles}
              />
            </div>
            <div className="session-actions">
              <button className="session-create-btn-cancel" onClick={handleCancelCreation}>Annuler</button>
            </div>
          </div>

          {/* Déverrouillage des exercices si 1+ muscle sélectionné */}
          {draftMuscles.length > 0 && (
            <div className="session-exercises">
              <div className="input-row" style={{ marginBottom: 6 }}>
                <input
                  type="text"
                  value={draftExInput}
                  onChange={(e) => setDraftExInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddDraftExercise()}
                  placeholder="Ajouter un exercice..."
                />
                <button className="add-button" onClick={() => handleAddDraftExercise()}>+</button>
              </div>

              {/* Suggestions basées sur les muscles sélectionnés */}
              <div className="biblio-groups">
                {draftMuscles.map(id => (
                  <div key={id} className="biblio-group">
                    <p className="biblio-group-label">{MUSCLES.find(m => m.id === id)?.label}</p>
                    <div className="biblio-suggestions">
                      {EXERCISES_BY_MUSCLE[id]?.filter(n => !draftExercises.includes(n)).map(name => (
                        <button key={name} className="biblio-chip" onClick={() => handleAddDraftExercise(name)}>{name}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Liste des exercices ajoutés au draft */}
              {draftExercises.length > 0 && (
                <div className="exercise-tags">
                  {draftExercises.map((ex, i) => (
                    <span key={i} className="exercise-tag">
                      <span className="exercise-tag-name">{ex}</span>
                      <button className="exercise-tag-delete" onClick={() => setDraftExercises(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ padding: '0 16px 16px' }}>
            <button
              className="session-save-btn session-save-btn-new"
              onClick={handleConfirmCreation}
              disabled={!draftName.trim()}
            >
              ✓ Créer la séance
            </button>
          </div>
        </div>
      )}

      {/* LISTE DES SÉANCES EXISTANTES */}
      {sessions.map((session, index) => {
        const muscles = session.muscles || [];
        const isExpanded = expandedIndex === index;
        const isSaved = savedIndex === index;
        const exCount = session.exercises.length;

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
                    onKeyDown={(e) => e.key === "Enter" && confirmRename(index)}
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
                <button className="duplicate-btn" title="Dupliquer" onClick={() => duplicateSession(index)}>❐</button>
                <button className="rename-btn" title="Renommer" onClick={() => { setRenamingIndex(index); setRenameValue(session.name); }}>✎</button>
                <button className="delete-session" title="Supprimer" onClick={() => deleteSession(index)}>✕</button>
              </div>
            </div>

            {isExpanded && (
              <div className="session-exercises">
                <div className="input-row" style={{ marginBottom: 6 }}>
                  <input
                    type="text"
                    value={exerciseInputs[index] || ""}
                    onChange={(e) => setExerciseInputs(prev => ({ ...prev, [index]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addExercise(index, exerciseInputs[index])}
                    placeholder="Exercice personnalisé..."
                  />
                  <button className="add-button" onClick={() => { addExercise(index, exerciseInputs[index]); setExerciseInputs(p => ({...p, [index]: ""})); }}>+</button>
                </div>

                {exCount > 0 && (
                  <div className="exercise-tags">
                    {session.exercises.map((ex, i) => (
                      <span key={i} className="exercise-tag">
                        <span className="exercise-tag-arrows">
                          <button className="tag-arrow-btn" disabled={i === 0} onClick={() => moveExercise(index, i, -1)}>↑</button>
                          <button className="tag-arrow-btn" disabled={i === exCount - 1} onClick={() => moveExercise(index, i, 1)}>↓</button>
                        </span>
                        <span className="exercise-tag-name">{ex.name}</span>
                        <button className="exercise-tag-delete" onClick={() => deleteExercise(index, i)}>×</button>
                      </span>
                    ))}
                  </div>
                )}

                <button className="session-save-btn" onClick={() => setExpandedIndex(null)}>
                  ✓ Enregistrer
                </button>
              </div>
            )}

            <button className="session-expand-btn" onClick={() => toggleExpand(index)}>
              {isExpanded ? "▲ Réduire" : `▼ ${exCount} exercice${exCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        );
      })}
    </div>
  );
}