import React, { useState } from "react";

export default function ExerciseList({ exercises, addSet }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [weights, setWeights] = useState({});
  const [reps, setReps] = useState({});

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleWeightChange = (exerciseIndex, value) => {
    setWeights((prev) => ({ ...prev, [exerciseIndex]: Number(value) }));
  };

  const handleRepsChange = (exerciseIndex, value) => {
    setReps((prev) => ({ ...prev, [exerciseIndex]: Number(value) }));
  };

  const handleAddSet = (exerciseIndex) => {
    const weight = weights[exerciseIndex] ?? 0;
    const rep = reps[exerciseIndex] ?? 1;

    if (weight >= 0 && rep > 0) {
      addSet(exerciseIndex, weight, rep);
      setWeights((prev) => ({ ...prev, [exerciseIndex]: 0 }));
      setReps((prev) => ({ ...prev, [exerciseIndex]: 1 }));
      setExpandedIndex(exerciseIndex);
    }
  };

  return (
    <ul className="exercise-list">
      {exercises.map((exercise, index) => (
        <li
          key={index}
          className={`exercise-item ${expandedIndex === index ? "expanded" : ""}`}
        >
          <div className="exercise-header">
            <div className="exercise-info" onClick={() => toggleExpand(index)}>
              <span className="exercise-name">{exercise.name}</span>
            </div>
            <button className="add-set-button" onClick={() => handleAddSet(index)}>
              +1 Série
            </button>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {expandedIndex === index && (
            <div className="set-inputs">
              <select
                value={weights[index] ?? 0}
                onChange={(e) => handleWeightChange(index, e.target.value)}
              >
                {[...Array(201).keys()].map((kg) => (
                  <option key={kg} value={kg}>{kg} kg</option>
                ))}
              </select>

              <select
                value={reps[index] ?? 1}
                onChange={(e) => handleRepsChange(index, e.target.value)}
              >
                {[...Array(50).keys()].map((rep) => (
                  <option key={rep + 1} value={rep + 1}>{rep + 1} reps</option>
                ))}
              </select>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
