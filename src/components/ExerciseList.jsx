// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
import React, { useState, useEffect, useRef } from "react";

const WEIGHT_STEPS = Array.from({ length: 401 }, (_, i) => Math.round(i * 0.5 * 10) / 10);

function WeightInput({ value, onChange }) {
  const longPressRef = useRef(null);
  const repeatRef = useRef(null);
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => {
    return () => {
      clearTimeout(longPressRef.current);
      clearInterval(repeatRef.current);
    };
  }, []);

  const getIdx = (v) => {
    const idx = WEIGHT_STEPS.indexOf(v);
    return idx >= 0 ? idx : WEIGHT_STEPS.findIndex((w) => w >= v);
  };
  const step = (delta) => {
    const idx = getIdx(valueRef.current);
    const next = Math.max(0, Math.min(WEIGHT_STEPS.length - 1, idx + delta));
    onChange(WEIGHT_STEPS[next]);
  };
  const startLongPress = (delta) => {
    longPressRef.current = setTimeout(() => {
      repeatRef.current = setInterval(() => step(delta * 10), 120);
    }, 400);
  };
  const stopLongPress = () => {
    clearTimeout(longPressRef.current);
    clearInterval(repeatRef.current);
  };
  const display = Number.isInteger(value) ? `${value}` : `${value.toFixed(1)}`;

  return (
    <div className="weight-input-wrap">
      <button
        className="weight-btn"
        onClick={() => step(-1)}
        onPointerDown={() => startLongPress(-1)}
        onPointerUp={stopLongPress}
        onPointerLeave={stopLongPress}
        type="button"
      >−</button>
      <div className="weight-display">
        <span className="weight-number">{display}</span>
        <span className="weight-unit">kg</span>
      </div>
      <button
        className="weight-btn"
        onClick={() => step(1)}
        onPointerDown={() => startLongPress(1)}
        onPointerUp={stopLongPress}
        onPointerLeave={stopLongPress}
        type="button"
      >+</button>
    </div>
  );
}

function StepInput({ value, onChange, min = 0, step = 1, unit = "" }) {
  const decrease = () => onChange(Math.max(min, value - step));
  const increase = () => onChange(value + step);
  return (
    <div className="step-input">
      <button className="step-btn" onClick={decrease} type="button">−</button>
      <span className="step-value">
        {value}{unit ? <span className="step-unit">{unit}</span> : null}
      </span>
      <button className="step-btn" onClick={increase} type="button">+</button>
    </div>
  );
}

function getLastSessionSets(history, exerciseName) {
  if (!history || history.length === 0) return null;
  for (const entry of history) {
    const found = entry.exercises.find(
      (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase()
    );
    if (found && found.sets.length > 0) return { sets: found.sets, date: entry.date };
  }
  return null;
}

function getBestSet(sets) {
  return sets.reduce((best, s) => (s.weight > best.weight ? s : best), sets[0]);
}

function DeltaBadge({ currentSets, lastSets }) {
  if (!lastSets || currentSets.length === 0) return null;
  const diff = Math.round((getBestSet(currentSets).weight - getBestSet(lastSets).weight) * 10) / 10;
  if (diff === 0) return null;
  return (
    <span className={`delta-badge ${diff > 0 ? "delta-up" : "delta-down"}`}>
      {diff > 0 ? "▲" : "▼"} {Math.abs(diff)} kg
    </span>
  );
}

function DumbbellSVG() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity:0.35}}>
      <rect x="4" y="22" width="8" height="12" rx="3" fill="currentColor"/>
      <rect x="44" y="22" width="8" height="12" rx="3" fill="currentColor"/>
      <rect x="10" y="19" width="6" height="18" rx="2" fill="currentColor"/>
      <rect x="40" y="19" width="6" height="18" rx="2" fill="currentColor"/>
      <rect x="16" y="26" width="24" height="4" rx="2" fill="currentColor"/>
    </svg>
  );
}

export default function ExerciseList({ exercises, history, addSet, deleteSet, flashIndex, onExpandedChange }) {
  const [expandedIndex, setExpandedIndex] = useState(exercises.length > 0 ? 0 : null);
  const [weights, setWeights] = useState(() => {
    const init = {};
    exercises.forEach((ex, i) => {
      const lastData = getLastSessionSets(history, ex.name);
      if (lastData && lastData.sets.length > 0) init[i] = getBestSet(lastData.sets).weight;
    });
    return init;
  });
  const [reps, setReps] = useState({});
  const [animating, setAnimating] = useState({});
  const prevExercisesLen = useRef(exercises.length);
  const inputRefs = useRef({});
  const prevTotalSets = useRef(exercises.reduce((t, ex) => t + ex.sets.length, 0));

  // Notifie le parent du nom de l'exercice actif (pour le header)
  useEffect(() => {
    if (onExpandedChange) {
      const name = expandedIndex !== null ? exercises[expandedIndex]?.name ?? null : null;
      onExpandedChange(name);
    }
  }, [expandedIndex, exercises, onExpandedChange]);

  // Scroll automatique lors du changement d'exercice (ex: "Exercice terminé")
  useEffect(() => {
    if (expandedIndex !== null) {
      setTimeout(() => {
        inputRefs.current[expandedIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }, [expandedIndex]);

  // Scroll automatique lors de l'ajout d'une série
  useEffect(() => {
    const total = exercises.reduce((t, ex) => t + ex.sets.length, 0);
    if (total > prevTotalSets.current && expandedIndex !== null) {
      setTimeout(() => {
        inputRefs.current[expandedIndex]?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 60);
    }
    prevTotalSets.current = total;
  }, [exercises, expandedIndex]);

  useEffect(() => {
    if (prevExercisesLen.current === 0 && exercises.length > 0) setExpandedIndex(0);
    prevExercisesLen.current = exercises.length;
  }, [exercises.length]);

  useEffect(() => {
    if (flashIndex !== null) {
      setAnimating((prev) => ({ ...prev, [flashIndex]: true }));
      const t = setTimeout(() => setAnimating((prev) => ({ ...prev, [flashIndex]: false })), 500);
      return () => clearTimeout(t);
    }
  }, [flashIndex]);

  const getWeight = (i) => weights[i] ?? 0;
  const getReps = (i) => reps[i] ?? 10;

  const handleAddSetInternal = (exerciseIndex) => {
    const weight = getWeight(exerciseIndex);
    const rep = getReps(exerciseIndex);
    if (weight >= 0 && rep > 0) {
      addSet(exerciseIndex, weight, rep);
    }
  };

  const handleNextExercise = (currentIndex) => {
    if (currentIndex + 1 < exercises.length) {
      setExpandedIndex(currentIndex + 1);
    } else {
      setExpandedIndex(null); // Referme tout si c'est le dernier
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="empty-state" style={{ height: "40vh" }}>
        <DumbbellSVG />
        <p>Aucun exercice dans cette séance</p>
        <small>Ajoute-en depuis l'onglet Séances</small>
      </div>
    );
  }

  return (
    <ul className="exercise-list">
      {exercises.map((exercise, index) => {
        const isExpanded = expandedIndex === index;
        const lastData = getLastSessionSets(history, exercise.name);
        return (
          <li key={index} className={`exercise-item ${animating[index] ? "flash" : ""}`}>
            <div className="exercise-header" onClick={() => setExpandedIndex(isExpanded ? null : index)}>
              <div className="exercise-header-left">
                <span className="exercise-name">{exercise.name}</span>
                {lastData && (
                  <span className="last-session-hint">
                    Dernière fois : 
                    {lastData.sets.map((s, i) => (
                      <span key={i}>
                        {i > 0 && <span className="hint-sep"> · </span>}
                        <span className="hint-set">{s.weight}kg×{s.reps}</span>
                      </span>
                    ))}
                    {exercise.sets.length > 0 && (
                      <DeltaBadge currentSets={exercise.sets} lastSets={lastData.sets} />
                    )}
                  </span>
                )}
              </div>
              <div className="exercise-header-right">
                {exercise.sets.length > 0 && (
                  <span className="exercise-set-count">{exercise.sets.length}×</span>
                )}
                <span className={`exercise-chevron ${isExpanded ? "open" : ""}`}>›</span>
              </div>
            </div>

            {exercise.sets.length > 0 && (
              <div className="exercise-sets-chips">
                {exercise.sets.map((set, i) => (
                  <button
                    key={i}
                    className="set-chip"
                    onClick={() => deleteSet(index, i)}
                    title="Appuyer pour supprimer"
                    type="button"
                  >
                    <span className="set-chip-weight">{set.weight}<span className="set-chip-unit">kg</span></span>
                    <span className="set-chip-sep">×</span>
                    <span className="set-chip-reps">{set.reps}</span>
                    <span className="set-chip-del">×</span>
                  </button>
                ))}
              </div>
            )}

            {isExpanded && (
              <div className="set-inputs" ref={(el) => { inputRefs.current[index] = el; }}>
                <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center' }}>
                  <WeightInput
                    value={getWeight(index)}
                    onChange={(v) => setWeights((prev) => ({ ...prev, [index]: v }))}
                  />
                  <StepInput
                    value={getReps(index)}
                    onChange={(v) => setReps((prev) => ({ ...prev, [index]: v }))}
                    unit=" reps" min={1} step={1}
                  />
                </div>

                <div className="exercise-card-footer">
                  <button 
                    className="btn-finish-serie" 
                    onClick={() => handleAddSetInternal(index)}
                    type="button"
                  >
                    Série terminée
                  </button>
                  <button 
                    className="btn-finish-exo" 
                    onClick={() => handleNextExercise(index)}
                    type="button"
                  >
                    Exercice terminé
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}