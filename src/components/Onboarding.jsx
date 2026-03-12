import React, { useState } from "react";

const STEPS = [
  {
    emoji: "🌴",
    title: "Bienvenue sur Workout",
    desc: "Ton compagnon d'entraînement minimaliste. Pas de compte, pas de cloud — tout reste sur ton téléphone.",
  },
  {
    emoji: "💪",
    title: "Crée tes séances",
    desc: "Ajoute des séances (Push, Pull, Legs…), configure tes exercices, et lance-toi. Le timer de repos démarre automatiquement.",
  },
  {
    emoji: "📊",
    title: "Suis ta progression",
    desc: "Termine une séance avec ✅ pour l'archiver. Retrouve ton historique, volume total et séries passées à tout moment.",
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-emoji">{s.emoji}</div>
        <h2 className="onboarding-title">{s.title}</h2>
        <p className="onboarding-desc">{s.desc}</p>

        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? "active" : ""}`} />
          ))}
        </div>

        <button className="onboarding-btn" onClick={() => isLast ? onDone() : setStep(step + 1)}>
          {isLast ? "C'est parti 🚀" : "Suivant"}
        </button>

        {!isLast && (
          <button className="onboarding-skip" onClick={onDone}>Passer</button>
        )}
      </div>
    </div>
  );
}
