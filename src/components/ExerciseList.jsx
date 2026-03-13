import React, { useState, useEffect, useRef } from "react";

const WEIGHT_STEPS = Array.from({ length: 81 }, (_, i) => Math.round(i * 2.5 * 10) / 10);

function StepInput({ value, onChange, min = 0, step = 1, unit = "" }) {
  const decrease = () => {
    if (unit === "kg") {
      const idx = WEIGHT_STEPS.indexOf(value);
      onChange(idx > 0 ? WEIGHT_STEPS[idx - 1] : WEIGHT_STEPS[0]);
    } else {
      onChange(Math.max(min, value - step));
    }
  };
  const increase = () => {
    if (unit === "kg") {
      const idx = WEIGHT_STEPS.indexOf(value);
      onChange(idx < WEIGHT_STEPS.length - 1 ? WEIGHT_STEPS[idx + 1] : WEIGHT_STEPS[WEIGHT_STEPS.length - 1]);
    } else {
      onChange(value + step);
    }
  };
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

export default function ExerciseList({ exercises, history, addSet, deleteSet, flashIndex }) {
  const [expandedIndex, setExpandedIndex] = useState(exercises.length > 0 ? 0 : null);
  const [weights, setWeights] = useState({});
  const [reps, setReps] = useState({});
  const [animating, setAnimating] = useState({});
  const prevExercisesLen = useRef(exercises.length);

  // Refs sur le formulaire de saisie de chaque exercice pour l'auto-scroll
  const inputRefs = useRef({});

  // Tracker le total de sets pour détecter un ajout
  const prevTotalSets = useRef(
    exercises.reduce((t, ex) => t + ex.sets.length, 0)
  );

  // Auto-scroll : scroll vers le formulaire de l'exercice actif après ajout de série
  useEffect(() => {
    const total = exercises.reduce((t, ex) => t + ex.sets.length, 0);
    if (total > prevTotalSets.current && expandedIndex !== null) {
      // Petit délai pour laisser le DOM se mettre à jour
      setTimeout(() => {
        inputRefs.current[expandedIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
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

  const handleAddSet = (exerciseIndex) => {
    const weight = getWeight(exerciseIndex);
    const rep = getReps(exerciseIndex);
    if (weight >= 0 && rep > 0) {
      addSet(exerciseIndex, weight, rep);
      setExpandedIndex(exerciseIndex);
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="empty-state" style={{ height: "40vh" }}>
        <span>🏋️</span>
        <p>Aucun exercice dans cette séance</p>
        <small>Ajoute-en depuis ⚙️ Gérer</small>
      </div>
    );
  }

  return (
    <ul className="exercise-list">
      {exercises.map((exercise, index) => {
        const isExpanded = expandedIndex === index;
        const lastData = getLastSessionSets(history, exercise.name);
        return (
          <li
            key={index}
            className={`exercise-item ${animating[index] ? "flash" : ""}`}
          >
            <div className="exercise-header" onClick={() => setExpandedIndex(isExpanded ? null : index)}>
              <div className="exercise-header-left">
                <span className="exercise-name">{exercise.name}</span>
                {lastData && (
                  <span className="last-session-hint">
                    Dernière fois :{" "}
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
              <div className="exercise-sets">
                <p>Séries effectuées :</p>
                <div className="series-container">
                  {exercise.sets.map((set, i) => (
                    <div key={i} className="series-row">
                      <span className="series-number">{i + 1}</span>
                      <span className="series-weight">{set.weight} kg</span>
                      <span className="series-reps">{set.reps} reps</span>
                      <button className="series-delete" onClick={() => deleteSet(index, i)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulaire de saisie — ref pour l'auto-scroll */}
            {isExpanded && (
              <div
                className="set-inputs"
                ref={(el) => { inputRefs.current[index] = el; }}
              >
                <StepInput
                  value={getWeight(index)}
                  onChange={(v) => setWeights((prev) => ({ ...prev, [index]: v }))}
                  unit="kg" min={0}
                />
                <StepInput
                  value={getReps(index)}
                  onChange={(v) => setReps((prev) => ({ ...prev, [index]: v }))}
                  unit=" reps" min={1} step={1}
                />
                <button className="add-set-button" onClick={() => handleAddSet(index)}>+ Série</button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
