# NOVSTATS

Extension Chrome/Firefox qui affiche les stats CS2 directement sur les profils Steam.

---

## Ce que fait l'extension

Quand tu visites un profil Steam (`steamcommunity.com/profiles/...` ou `/id/...`), un panneau NOVSTATS apparaît automatiquement avec deux sections :

**CS2 Stats** (Leetify + CSStats combinés)
- Nombre de matchs, 1er match, Winrate, KD
- Rating, Aim, Positioning, Utility, Clutching, Opening, Pre-aim, Reaction Time

**FACEIT**
- ELO + niveau affiché dans le header
- Date de création, Matchs, KD, HS%, Winrate, Avg. Kills
- Les 5 derniers résultats (W/L en vert/rouge)

---

## Structure des fichiers

```
manifest.json              → config de l'extension (permissions, scripts)
assets/
  icon/                    → icônes de l'extension (déjà présentes)
  logos/                   → À CRÉER — mettre les logos Leetify & Faceit ici
src/
  background/
    background.js          → proxy pour les appels API (contourne le CORS)
  api/
    faceit.js              → Faceit API v4 (requiert clé API)
    leetify.js             → Leetify API publique
    csstats.js             → CSStats (optionnel, fallback)
  utils/
    cache.js               → cache localStorage 5 min
    formatters.js          → format des valeurs + color-coding
  content/
    ui-builder.js          → génère et injecte le panel HTML
    data-binder.js         → bind les données API dans le DOM
    events.js              → collapse/expand du panel
    main.js                → point d'entrée, orchestration
  styles/
    content.css            → styles du panel (thème NOVSTATS blanc/bleu)
  popup/
    popup.html/js/css      → page de settings pour la clé API Faceit
image-locations.txt        → guide pour ajouter tes images
```

---

## Installation

1. Va sur `chrome://extensions/`
2. Active le **Mode développeur** (interrupteur en haut à droite)
3. Clique **Charger l'extension non empaquetée**
4. Sélectionne le dossier `novstats`
5. L'icône NOVSTATS apparaît dans la barre Chrome

---

## Configuration

### Clé API Faceit (obligatoire pour la section Faceit)
1. Crée un compte sur [developers.faceit.com](https://developers.faceit.com)
2. Crée une nouvelle app → type **Server Side** → copie la clé
3. Clique sur l'icône NOVSTATS dans Chrome → colle la clé → **Sauvegarder**

### Ajouter les logos (optionnel)
Voir le fichier `image-locations.txt` pour la liste complète et les instructions.

---

## Color-coding des stats

| Couleur | Signification |
|---------|---------------|
| Vert | Au-dessus de la moyenne (score > 58, KD > 1.3, WR > 55%) |
| Jaune | Dans la moyenne |
| Orange | En dessous de la moyenne |
| Rouge | Significativement en dessous |

---

## Sources de données

| Source | Usage | Auth |
|--------|-------|------|
| Leetify API | Scores de skill (aim, positioning, etc.) | Publique |
| CSStats | Stats brutes en fallback | Publique |
| Faceit API v4 | Toute la section Faceit | Clé API requise |
| Steam (XML) | Résolution des vanity URLs | Publique |
| flagsapi.com | Drapeaux des pays | Publique |
| Faceit CDN | Icônes de niveaux | Publique |

---

## Recharger après modification

Après chaque changement dans les fichiers :
`chrome://extensions/` → bouton **Recharger** (icône circulaire) à côté de NOVSTATS
