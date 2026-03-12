import React, { useState, useEffect } from "react";

export default function ExerciseList({ exercises, addSet, deleteSet, flashIndex }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [weights, setWeights] = useState({});
  const [reps, setReps] = useState({});
  const [animating, setAnimating] = useState({});

  useEffect(() => {
    if (flashIndex !== null) {
      setAnimating((prev) => ({ ...prev, [flashIndex]: true }));
      const t = setTimeout(() => setAnimating((prev) => ({ ...prev, [flashIndex]: false })), 500);
      return () => clearTimeout(t);
    }
  }, [flashIndex]);

  const handleAddSet = (exerciseIndex) => {
    const weight = weights[exerciseIndex] ?? 0;
    const rep = reps[exerciseIndex] ?? 1;
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
        <small>Ajoute-en depuis ✏️ Gérer les séances</small>
      </div>
    );
  }

  return (
    <ul className="exercise-list">
      {exercises.map((exercise, index) => (
        <li key={index}
          className={`exercise-item ${expandedIndex === index ? "expanded" : ""} ${animating[index] ? "flash" : ""}`}>
          <div className="exercise-header">
            <span className="exercise-name" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
              {exercise.name}
            </span>
            <div className="exercise-header-right">
              {exercise.sets.length > 0 && (
                <span className="exercise-set-count">{exercise.sets.length}×</span>
              )}
              <button className="add-set-button" onClick={() => handleAddSet(index)}>+1 Série</button>
            </div>
          </div>

          {exercise.sets.length > 0 && (
            <div className="exercise-sets">
              <p>Séries effectuées :</p>
              <div className="series-container">
                {exercise.sets.map((set, i) => (
                  <div key={i} className="series-row series-enter">
                    <span className="series-number">{i + 1}</span>
                    <span className="series-weight">{set.weight} kg</span>
                    <span className="series-reps">{set.reps} reps</span>
                    <button className="series-delete" onClick={() => deleteSet(index, i)} title="Supprimer">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expandedIndex === index && (
            <div className="set-inputs">
              <select value={weights[index] ?? 0}
                onChange={(e) => setWeights((prev) => ({ ...prev, [index]: Number(e.target.value) }))}>
                {[...Array(201).keys()].map((kg) => <option key={kg} value={kg}>{kg} kg</option>)}
              </select>
              <select value={reps[index] ?? 1}
                onChange={(e) => setReps((prev) => ({ ...prev, [index]: Number(e.target.value) }))}>
                {[...Array(50).keys()].map((r) => <option key={r + 1} value={r + 1}>{r + 1} reps</option>)}
              </select>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
