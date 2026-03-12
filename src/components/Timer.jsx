import React, { useState, useEffect, useRef } from "react";

const DEFAULT_REST = 75;

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1.2);
  } catch (e) {
    // AudioContext non dispo
  }
}

function sendNotification() {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏱ Repos terminé !", { body: "C'est reparti 💪", silent: true });
  }
}

export default function Timer({ resetTrigger }) {
  const [restDuration, setRestDuration] = useState(DEFAULT_REST);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_REST);
  const [isRunning, setIsRunning] = useState(false);
  const prevTrigger = useRef(resetTrigger);

  // Demande permission notif au premier rendu
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const adjustDuration = (amount) => {
    setRestDuration((prev) => {
      const next = Math.max(10, prev + amount);
      if (!isRunning) setTimeLeft(next);
      return next;
    });
  };

  useEffect(() => {
    if (resetTrigger !== prevTrigger.current) {
      prevTrigger.current = resetTrigger;
      setTimeLeft(restDuration);
      setIsRunning(true);
    }
  }, [resetTrigger, restDuration]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          playBeep();
          sendNotification();
          if ("vibrate" in navigator) navigator.vibrate([300, 100, 300]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const pct = restDuration > 0 ? timeLeft / restDuration : 0;
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = circ * pct;

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="timer-wrap">
      <div className="timer-ring-container">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
          <circle
            cx="48" cy="48" r={radius} fill="none"
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
        <button className="timer-adjust" onClick={() => adjustDuration(-15)}>−15s</button>
        <button
          className="timer-adjust"
          onClick={() => {
            if (isRunning) {
              setIsRunning(false);
              setTimeLeft(restDuration);
            } else {
              setIsRunning(true);
            }
          }}
        >
          {isRunning ? "⏹" : "▶"}
        </button>
        <button className="timer-adjust" onClick={() => adjustDuration(15)}>+15s</button>
      </div>
    </div>
  );
}
