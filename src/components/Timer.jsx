import React, { useState, useEffect, useRef } from "react";

export default function Timer({ resetTrigger }) {
  const DEFAULT = 75;
  const [timeLeft, setTimeLeft] = useState(DEFAULT);
  const [isRunning, setIsRunning] = useState(false);
  const prevTrigger = useRef(resetTrigger);

  const adjustTime = (amount) => setTimeLeft((prev) => Math.max(10, prev + amount));

  useEffect(() => {
    if (resetTrigger !== prevTrigger.current) {
      prevTrigger.current = resetTrigger;
      setTimeLeft(DEFAULT);
      setIsRunning(true);
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          if ("vibrate" in navigator) navigator.vibrate([300, 100, 300]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const pct = timeLeft / DEFAULT;
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = circ * pct;

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="timer-wrap">
      <div className="timer-ring-container">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
          <circle cx="48" cy="48" r={radius} fill="none"
            stroke={timeLeft === 0 ? "#ff4444" : "#28a745"}
            strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <span className={`timer-display ${timeLeft === 0 ? "timer-zero" : ""}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="timer-controls">
        <button className="timer-adjust" onClick={() => adjustTime(-15)}>−15s</button>
        <button className="timer-adjust" onClick={() => {
          if (isRunning) { setIsRunning(false); setTimeLeft(DEFAULT); }
          else setIsRunning(true);
        }}>{isRunning ? "⏹" : "▶"}</button>
        <button className="timer-adjust" onClick={() => adjustTime(15)}>+15s</button>
      </div>
    </div>
  );
}
