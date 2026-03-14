// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
// Icones SVG custom navbar — style iOS, trait fin, currentColor
import React from "react";

// Logo Workout Tracker — fleur de tiaré tahitienne avec haltère au centre
export function LogoTiare({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Workout Tracker">
      {/* 5 pétales de tiaré - Coordonnées centrées pour éviter le rognage */}
      <ellipse cx="24" cy="10" rx="5" ry="10" fill="var(--accent)" opacity="0.9" transform="rotate(0 24 24)"/>
      <ellipse cx="24" cy="10" rx="5" ry="10" fill="var(--accent)" opacity="0.9" transform="rotate(72 24 24)"/>
      <ellipse cx="24" cy="10" rx="5" ry="10" fill="var(--accent)" opacity="0.9" transform="rotate(144 24 24)"/>
      <ellipse cx="24" cy="10" rx="5" ry="10" fill="var(--accent)" opacity="0.9" transform="rotate(216 24 24)"/>
      <ellipse cx="24" cy="10" rx="5" ry="10" fill="var(--accent)" opacity="0.9" transform="rotate(288 24 24)"/>
      {/* Centre blanc */}
      <circle cx="24" cy="24" r="8" fill="white"/>
      {/* Haltère dans le centre */}
      <rect x="15" y="22.5" width="18" height="3" rx="1" fill="#1a1a1a"/>
      <rect x="14" y="20" width="4" height="8" rx="1.2" fill="#1a1a1a"/>
      <rect x="30" y="20" width="4" height="8" rx="1.2" fill="#1a1a1a"/>
    </svg>
  );
}

// Historique — graphe barres croissantes
export function IconHistory({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="14" width="3.5" height="7" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="8.25" y="10" width="3.5" height="11" rx="1" fill="currentColor" opacity="0.85"/>
      <rect x="13.5" y="6" width="3.5" height="15" rx="1" fill="currentColor"/>
      <rect x="18.75" y="3" width="3.5" height="18" rx="1" fill="currentColor"/>
    </svg>
  );
}

// Entrainement — haltere
export function IconTrain({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="9.5" width="3" height="5" rx="1.5" fill="currentColor"/>
      <rect x="20" y="9.5" width="3" height="5" rx="1.5" fill="currentColor"/>
      <rect x="3.5" y="8" width="2.5" height="8" rx="1" fill="currentColor"/>
      <rect x="18" y="8" width="2.5" height="8" rx="1" fill="currentColor"/>
      <rect x="6" y="11" width="12" height="2" rx="1" fill="currentColor"/>
    </svg>
  );
}

// Seances — liste avec tirets
export function IconSessions({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="2" rx="1" fill="currentColor"/>
      <rect x="3" y="11" width="13" height="2" rx="1" fill="currentColor"/>
      <rect x="3" y="17" width="9" height="2" rx="1" fill="currentColor"/>
    </svg>
  );
}

// Reglages — engrenage
export function IconSettings({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M10.27 2.34a2 2 0 0 1 3.46 0l.6 1.04a.5.5 0 0 0 .58.22l1.12-.37a2 2 0 0 1 2.45 1.73l.12 1.2a.5.5 0 0 0 .4.43l1.18.26a2 2 0 0 1 1.22 2.9l-.6 1.04a.5.5 0 0 0 0 .54l.6 1.04a2 2 0 0 1-1.22 2.9l-1.18.26a.5.5 0 0 0-.4.43l-.12 1.2a2 2 0 0 1-2.45 1.73l-1.12-.37a.5.5 0 0 0-.58.22l-.6 1.04a2 2 0 0 1-3.46 0l-.6-1.04a.5.5 0 0 0-.58-.22l-1.12.37a2 2 0 0 1-2.45-1.73l-.12-1.2a.5.5 0 0 0-.4-.43l-1.18-.26a2 2 0 0 1-1.22-2.9l.6-1.04a.5.5 0 0 0 0-.54l-.6-1.04a2 2 0 0 1 1.22-2.9l1.18-.26a.5.5 0 0 0 .4-.43l.12-1.2A2 2 0 0 1 8.57 3.2l1.12.37a.5.5 0 0 0 .58-.22l.6-1.04zM12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}