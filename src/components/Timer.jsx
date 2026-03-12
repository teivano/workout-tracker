import React, { useState, useEffect } from "react";

export default function Timer({ resetTrigger }) {
  const [timeLeft, setTimeLeft] = useState(75);
  const [isRunning, setIsRunning] = useState(false);
  const [localResetTrigger, setLocalResetTrigger] = useState(resetTrigger);

  const adjustTime = (amount) => {
    setTimeLeft((prev) => Math.max(10, prev + amount));
  };

  useEffect(() => {
    if (resetTrigger !== localResetTrigger) {
      setTimeLeft(75);
      setIsRunning(true);
      setLocalResetTrigger(resetTrigger);
    }
  }, [resetTrigger, localResetTrigger]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          triggerEndEffects();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const triggerEndEffects = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([300, 100, 300]);
    }
  };

  const resetTimer = () => {
    setTimeLeft(75);
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="timer-container">
      <button className="timer-adjust" onClick={() => adjustTime(-5)}>➖</button>
      <h2 className={timeLeft === 0 ? "timer-zero" : ""}>
        {formatTime(timeLeft)}
      </h2>
      <button className="timer-adjust" onClick={() => adjustTime(5)}>➕</button>

      {isRunning && (
        <button className="reset-button" onClick={resetTimer}>🟥</button>
      )}
    </div>
  );
}
