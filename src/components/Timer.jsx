// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
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
    // .catch() ajouté : une rejection non gérée crashait le composant
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
    }).catch(() => {});
  } catch (e) {}
}

function sendNotification() {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏱ Repos terminé !", { body: "C'est reparti 💪", silent: true });
    }
  } catch (e) {}
}

export default function Timer({ resetTrigger, onTimerUpdate }) {
  const [restDuration] = useState(() => {
    const saved = parseInt(localStorage.getItem("rest_duration"), 10);
    return !isNaN(saved) && saved >= 10 ? saved : 75;
  });
  const [timeLeft, setTimeLeft] = useState(restDuration);
  const [isRunning, setIsRunning] = useState(false);
  const prevTrigger = useRef(resetTrigger);

  // Remonte l'état au parent
  useEffect(() => {
    if (onTimerUpdate) {
      const pct = restDuration > 0 ? timeLeft / restDuration : 1;
      onTimerUpdate(pct, isRunning);
    }
  }, [timeLeft, isRunning, restDuration, onTimerUpdate]);

  // Demande permission notif
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Démarrage du timer au reset (nouvelle série ajoutée)
  useEffect(() => {
    if (resetTrigger !== prevTrigger.current) {
      prevTrigger.current = resetTrigger;
      try { getAudioCtx().resume(); } catch (e) {}
      setTimeLeft(restDuration);
      setIsRunning(true);
    }
  }, [resetTrigger, restDuration]);

  // Tick du countdown — ne fait QUE décrémenter, rien d'autre dans le callback
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Réaction quand le timer arrive à 0 — séparé du setInterval pour éviter
  // setState-dans-setState qui crashait la page en blanc
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playBeep();
      sendNotification();
      try { if ("vibrate" in navigator) navigator.vibrate([300, 100, 300]); } catch (e) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

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
  // Cercle rouge quand < 10% du temps restant (comme la progress bar)
  const isLow = pct < 0.10 && isRunning;
  const ringColor = isDone ? "#ff4444" : isLow ? "#ff2a2a" : "var(--accent)";

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={`timer-bubble${isIdle ? " timer-bubble-idle" : ""}${isDone ? " timer-bubble-done" : ""}${isRunning ? " timer-bubble-running" : ""}`}>
      <div className="timer-bubble-ring" onClick={handlePlayStop}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle cx="36" cy="36" r={radius} fill="none"
            stroke={ringColor}
            strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.4s ease" }}
          />
        </svg>
        <span className={`timer-bubble-time${isDone ? " timer-bubble-time-done" : ""}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
}
