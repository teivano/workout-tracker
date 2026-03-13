import React, { useState, useEffect, useRef } from "react";

const DEFAULT_REST = 75;

// Contexte audio partagé — créé au premier interact pour contourner l'autoplay mobile
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
    new Notification("⏱ Repos terminé !", { body: "C'est reparti 💪", silent: true });
  }
}

export default function Timer({ resetTrigger }) {
  const [restDuration, setRestDuration] = useState(DEFAULT_REST);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_REST);
  const [isRunning, setIsRunning] = useState(false);
  const prevTrigger = useRef(resetTrigger);

  // Demande permission notif au montage
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Réinitialise et démarre automatiquement quand une série est ajoutée
  useEffect(() => {
    if (resetTrigger !== prevTrigger.current) {
      prevTrigger.current = resetTrigger;
      // On réveille le contexte audio dès le premier ajout de série
      try { getAudioCtx().resume(); } catch (e) {}
      setTimeLeft(restDuration);
      setIsRunning(true);
    }
  }, [resetTrigger, restDuration]);

  // Décompte
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

  const adjustDuration = (amount) => {
    setRestDuration((prev) => {
      const next = Math.max(10, prev + amount);
      if (!isRunning) setTimeLeft(next);
      return next;
    });
  };

  const handlePlayStop = () => {
    // On réveille le ctx audio au clic utilisateur pour garantir le son
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
    <div className={`timer-bubble ${
      isIdle ? "timer-bubble-idle" : ""
    } ${
      isDone ? "timer-bubble-done" : ""
    } ${
      isRunning ? "timer-bubble-running" : ""
    }`}>
      {/* Anneau SVG */}
      <div className="timer-bubble-ring" onClick={handlePlayStop} title={isRunning ? "Arrêter" : "Démarrer"}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          {/* Fond */}
          <circle cx="36" cy="36" r={radius} fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          {/* Progression */}
          <circle cx="36" cy="36" r={radius} fill="none"
            stroke={isDone ? "#ff4444" : "#28a745"}
            strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <span className={`timer-bubble-time ${isDone ? "timer-bubble-time-done" : ""}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Boutons ±15s */}
      <div className="timer-bubble-adj">
        <button className="timer-bubble-btn" onClick={() => adjustDuration(-15)}>−15s</button>
        <button className="timer-bubble-btn" onClick={() => adjustDuration(15)}>+15s</button>
      </div>
    </div>
  );
}
