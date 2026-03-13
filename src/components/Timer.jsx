import React, { useState, useEffect, useRef } from "react";

let sharedAudioCtx = null;
function getAudioCtx() {
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedAudioCtx;
}

function playBeep() {
  try {
    const ctx = getAudioCtx();
    const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
    resume.then(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.4);
    });
  } catch (e) {}
}

function sendNotification() {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("\u23f1 Repos termin\u00e9 !", { body: "C'est reparti \ud83d\udcaa", silent: true });
  }
}

export default function Timer({ resetTrigger, onTimerUpdate }) {
  // Lit la durée persistée dans localStorage (réglée depuis Settings)
  const [restDuration] = useState(() => {
    const saved = parseInt(localStorage.getItem("rest_duration"), 10);
    return !isNaN(saved) && saved >= 10 ? saved : 75;
  });
  const [timeLeft, setTimeLeft] = useState(restDuration);
  const [isRunning, setIsRunning] = useState(false);
  const prevTrigger = useRef(resetTrigger);

  // Notifie le parent du % restant et de l'état running
  useEffect(() => {
    if (onTimerUpdate) {
      // pct = 0 quand le temps est écoulé, 1 quand on vient de lancer
      const pct = restDuration > 0 ? timeLeft / restDuration : 1;
      onTimerUpdate(pct, isRunning);
    }
  }, [timeLeft, isRunning, restDuration, onTimerUpdate]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Reset + démarrage auto quand une série est ajoutée
  useEffect(() => {
    if (resetTrigger !== prevTrigger.current) {
      prevTrigger.current = resetTrigger;
      try { getAudioCtx().resume(); } catch (e) {}
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

  const handlePlayStop = () => {
    try { getAudioCtx().resume(); } catch (e) {}
    if (isRunning) {
      setIsRunning(false);
      setTimeLeft(restDuration);
    } else {
      setIsRunning(true);
    }
  };

  const pct = restDuration > 0 ? timeLeft / restDuration : 0;
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = circ * pct;
  const isDone = timeLeft === 0 && !isRunning;
  const isIdle = !isRunning && timeLeft === restDuration;

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={`timer-bubble${
      isIdle ? " timer-bubble-idle" : ""
    }${
      isDone ? " timer-bubble-done" : ""
    }${
      isRunning ? " timer-bubble-running" : ""
    }`}>
      <div className="timer-bubble-ring" onClick={handlePlayStop}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle cx="36" cy="36" r={radius} fill="none"
            stroke={isDone ? "#ff4444" : "var(--accent)"}
            strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <span className={`timer-bubble-time${isDone ? " timer-bubble-time-done" : ""}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      {/* Boutons −15s/+15s supprimés — réglage via Settings */}
    </div>
  );
}
