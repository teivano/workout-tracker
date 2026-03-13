// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
// Timer headless — aucun rendu, toute la logique remonte via onTimerUpdate
import { useState, useEffect, useRef } from "react";

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

  // Remonte l'etat a chaque tick
  useEffect(() => {
    if (onTimerUpdate) {
      const pct = restDuration > 0 ? timeLeft / restDuration : 1;
      onTimerUpdate(pct, isRunning, timeLeft);
    }
  }, [timeLeft, isRunning, restDuration, onTimerUpdate]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Demarre le timer a chaque nouveau set
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
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Fin du timer
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playBeep();
      sendNotification();
      try { if ("vibrate" in navigator) navigator.vibrate([300, 100, 300]); } catch (e) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Expose toggle au parent via onTimerUpdate — le header gere le click
  // (pas de rendu ici)
  return null;
}
