# 🌴 Workout Tracker — Roadmap

## Stack
- React 19 + Vite
- CSS vanilla (Poppins, dark theme)
- localStorage (pas de backend)
- PWA activée
- Déployé sur Vercel → teivano.fr
- Repo : github.com/teivano/workout-tracker

---

## État actuel
- ✅ Gestion de séances (créer, supprimer, sélectionner)
- ✅ Ajout d'exercices par séance
- ✅ Enregistrement de séries (poids + reps)
- ✅ Timer de repos avec vibration
- ✅ Header fixe avec navigation
- ✅ Side menu
- ✅ Dark theme Poppins
- ✅ PWA activée
- ✅ Persistance localStorage sécurisée
- ✅ Confirmation avant suppression
- ✅ Phase 0 — Responsive mobile / tablet / desktop
- ✅ Phase 1 — Historique par date

---

## Phases à venir

### Phase 0 — Responsive ✅ TERMINÉE

### Phase 1 — Historique par date ✅ TERMINÉE
- Modèle de données : chaque séance a un tableau `history[]`
- Bouton ✅ dans le header pour archiver une séance terminée
- Composant `History.jsx` : liste des sessions passées, volume total, détail par exercice
- Migration automatique des données existantes
- Badge dans le menu latéral indiquant le nombre de sessions archivées

---

### Phase 2 — Features d'entraînement ⬅️ À FAIRE
- **11** Supprimer / modifier une série enregistrée
- **10** Repos suggéré selon l'exercice (configurable par exercice)
- **13** Notes par série ou par séance
- **12** Réorganiser l'ordre des exercices (boutons ↑↓)

---

### Phase 3 — Gestion des séances
- **14** Duplication d'une séance
- **15** Bibliothèque d'exercices pré-remplie (squat, bench, deadlift...)
- **16** Catégories de séances (Push / Pull / Legs / Full Body)
- **9** Comparaison avec la dernière séance

---

### Phase 4 — Polish UI
- **4** États vides illustrés
- **3** Onboarding pour nouvel utilisateur
- **2** Micro-animations sur les interactions
- **5** Typographie hiérarchisée cohérente
- **1** Identité visuelle — logo, palette, iconographie

---

## Instructions pour Claude
À chaque nouvelle conversation :
1. Lire ce fichier ROADMAP.md
2. Lire les fichiers concernés par la phase en cours
3. Coder et pousser directement sur `main`
4. Vercel redéploie automatiquement
5. Valider avec Teivano avant de passer à la phase suivante
