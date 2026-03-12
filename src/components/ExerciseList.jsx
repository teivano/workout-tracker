import React, { useState, useEffect, useRef } from "react";

// Génère les valeurs de poids : 0, 2.5, 5, ..., 200
const WEIGHT_STEPS = Array.from({ length: 81 }, (_, i) => Math.round(i * 2.5 * 10) / 10);

function StepInput({ value, onChange, min = 0, step = 1, unit = "" }) {
  const decrease = () => {
    const idx = WEIGHT_STEPS.indexOf(value);
    if (unit === "kg") {
      const next = idx > 0 ? WEIGHT_STEPS[idx - 1] : WEIGHT_STEPS[0];
      onChange(next);
    } else {
      onChange(Math.max(min, value - step));
    }
  };
  const increase = () => {
    if (unit === "kg") {
      const idx = WEIGHT_STEPS.indexOf(value);
      const next = idx < WEIGHT_STEPS.length - 1 ? WEIGHT_STEPS[idx + 1] : WEIGHT_STEPS[WEIGHT_STEPS.length - 1];
      onChange(next);
    } else {
      onChange(value + step);
    }
  };

  return (
    <div className="step-input">
      <button className="step-btn" onClick={decrease} type="button">−</button>
      <span className="step-value">{value}{unit ? <span className="step-unit">{unit}</span> : null}</span>
      <button className="step-btn" onClick={increase} type="button">+</button>
    </div>
  );
}

export default function ExerciseList({ exercises, addSet, deleteSet, flashIndex }) {
  // Premier exercice ouvert par défaut
  const [expandedIndex, setExpandedIndex] = useState(exercises.length > 0 ? 0 : null);
  const [weights, setWeights] = useState({});
  const [reps, setReps] = useState({});
  const [animating, setAnimating] = useState({});
  const prevExercisesLen = useRef(exercises.length);

  // Ouvre le premier exercice si la liste était vide et reçoit des exercices
  useEffect(() => {
    if (prevExercisesLen.current === 0 && exercises.length > 0) {
      setExpandedIndex(0);
    }
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
      // Garde le panel ouvert après ajout
      setExpandedIndex(exerciseIndex);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (exercises.length === 0) {
    return (
      <div className="empty-state" style={{ height: "40vh" }}>
        <span>🏋️</span>
        <p>Aucun exercice dans cette séance</p>
        <small>Ajoute-en depuis ✏️ Gérer les séances</small>
      </div>
    );
  }

  return (
    <ul className="exercise-list">
      {exercises.map((exercise, index) => {
        const isExpanded = expandedIndex === index;
        const lastSet = exercise.sets[exercise.sets.length - 1];

        return (
          <li
            key={index}
            className={`exercise-item ${
              isExpanded ? "expanded" : ""
            } ${animating[index] ? "flash" : ""}`}
          >
            {/* ── Header ── */}
            <div className="exercise-header" onClick={() => toggleExpand(index)}>
              <span className="exercise-name">{exercise.name}</span>
              <div className="exercise-header-right">
                {exercise.sets.length > 0 && (
                  <span className="exercise-set-count">{exercise.sets.length}×</span>
                )}
                <span className={`exercise-chevron ${isExpanded ? "open" : ""}`}>›</span>
              </div>
            </div>

            {/* ── Séries enregistrées (toujours visibles si sets > 0) ── */}
            {exercise.sets.length > 0 && (
              <div className="exercise-sets">
                <p>Séries effectuées :</p>
                <div className="series-container">
                  {exercise.sets.map((set, i) => (
                    <div key={i} className="series-row series-enter">
                      <span className="series-number">{i + 1}</span>
                      <span className="series-weight">{set.weight} kg</span>
                      <span className="series-reps">{set.reps} reps</span>
                      <button
                        className="series-delete"
                        onClick={() => deleteSet(index, i)}
                        title="Supprimer"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Formulaire saisie (visible si expanded) ── */}
            {isExpanded && (
              <div className="set-inputs">
                <StepInput
                  value={getWeight(index)}
                  onChange={(v) => setWeights((prev) => ({ ...prev, [index]: v }))}
                  unit="kg"
                  min={0}
                />
                <StepInput
                  value={getReps(index)}
                  onChange={(v) => setReps((prev) => ({ ...prev, [index]: v }))}
                  unit=" reps"
                  min={1}
                  step={1}
                />
                <button
                  className="add-set-button"
                  onClick={() => handleAddSet(index)}
                >
                  + Série
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
