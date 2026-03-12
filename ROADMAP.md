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

---

## Phases à venir

### Phase 0 — Responsive ⬅️ À FAIRE EN PREMIER
Rendre l'app belle sur mobile, tablet et desktop.
- **Mobile** < 480px — layout actuel, colonne unique
- **Tablet** 480–1024px — marges plus généreuses, side menu plus large
- **Desktop** > 1024px — layout 2 colonnes : side menu permanent à gauche, contenu à droite (hamburger masqué)
- Fichiers à modifier : `src/App.jsx` + `src/index.css`

---

### Phase 1 — Historique par date
Refonte du modèle de données — base de toutes les features suivantes.
- Chaque séance garde un historique des sessions passées par date
- Nouvelle structure localStorage :
```json
{
  "name": "Push",
  "exercises": [...],
  "history": [
    { "date": "2026-03-12", "exercises": [...] }
  ]
}
```
- Nouveau composant `History.jsx`
- ⚠️ Prévoir migration des données existantes en localStorage

---

### Phase 2 — Features d'entraînement
- **11** Supprimer / modifier une série enregistrée
- **10** Repos suggéré selon l'exercice (configurable par exercice)
- **13** Notes par série ou par séance
- **12** Réorganiser l'ordre des exercices (drag or boutons ↑↓)

---

### Phase 3 — Gestion des séances
- **14** Duplication d'une séance
- **15** Bibliothèque d'exercices pré-remplie (squat, bench, deadlift...)
- **16** Catégories de séances (Push / Pull / Legs / Full Body)
- **9** Comparaison avec la dernière séance (dépend de la Phase 1)

---

### Phase 4 — Polish UI
À faire en dernier, quand les features sont stables.
- **4** États vides illustrés ("Ajoute ton premier exercice !")
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
