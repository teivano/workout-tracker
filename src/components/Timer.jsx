import React, { useState, useEffect, useRef } from "react";

const DEFAULT_REST = 75;

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {}
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
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const dash = circ * pct;
  const isDone = timeLeft === 0;
  const isIdle = !isRunning && !isDone && timeLeft === restDuration;

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={`timer-sticky ${isIdle ? "timer-idle" : ""} ${isDone ? "timer-done" : ""}`}>
      {/* Anneau compact */}
      <div className="timer-ring-sm">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
          <circle
            cx="26" cy="26" r={radius} fill="none"
            stroke={isDone ? "#ff4444" : "#28a745"}
            strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 26 26)"
            style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <span className={`timer-display-sm ${isDone ? "timer-zero" : ""}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Contrôles inline */}
      <div className="timer-controls-sm">
        <button className="timer-adj-sm" onClick={() => adjustDuration(-15)}>−15s</button>
        <button
          className="timer-adj-sm timer-play-sm"
          onClick={() => {
            if (isRunning) { setIsRunning(false); setTimeLeft(restDuration); }
            else setIsRunning(true);
          }}
        >
          {isRunning ? "⏹" : "▶"}
        </button>
        <button className="timer-adj-sm" onClick={() => adjustDuration(15)}>+15s</button>
      </div>

      {/* Barre de progression sous le bandeau */}
      <div className="timer-progress-bar">
        <div
          className={`timer-progress-fill ${isDone ? "timer-progress-done" : ""}`}
          style={{ width: `${pct * 100}%`, transition: "width 0.9s linear" }}
        />
      </div>
    </div>
  );
}
