# VLS 2 — Suivi d'équipe

Site de suivi pour l'équipe VLS 2 : résultats de matchs, compositions par
set/poste, et quelques statistiques de base. Stack : React + TypeScript +
Vite, déployé sur GitHub Pages via GitHub Actions.

## État actuel

Socle V1 avec des **données d'exemple fictives** (`demo: true`) dans
`src/data/`. Rien de réel n'est encore saisi.

## Schéma de données

Trois fichiers JSON dans `src/data/`, décrits dans `src/types.ts` :

- **`joueuses.json`** — l'effectif. Chaque joueuse a un `posteCle` : son
  poste attribué pour la saison (Passeur, Pointu, Central,
  Réceptionneur-Attaquant, Libero).
- **`matches.json`** — un match par entrée : date, adversaire, domicile ou
  extérieur, lieu, et le score de chaque set joué.
- **`compositions.json`** — une entrée par set joué, avec les 6 positions du
  terrain (P1 à P6, numérotation rotation volley) et pour chacune : la
  joueuse et le poste réellement joué ce set-là (`posteJoue`), qui peut
  différer du `posteCle` de la joueuse (ex : une passeuse qui joue en
  réceptionneuse-attaquante sur un set donné).

C'est ce dernier point qui permet de distinguer "poste habituel" et "poste
joué", et donc de repérer les changements ponctuels de poste dans l'onglet
Stats.

## Prochaine étape : remplacer les données d'exemple

Deux options, à décider ensemble :

1. **Édition directe des JSON** — le plus simple pour démarrer. Chaque
   personne qui saisit un match modifie les fichiers dans `src/data/` et
   pousse sur GitHub (nécessite un minimum d'aisance avec Git).
2. **Google Sheet en source de données** — plus accessible pour plusieurs
   coéquipiers qui ne sont pas à l'aise avec GitHub. Le site irait lire un
   Sheet publié (export CSV) au lieu des fichiers JSON locaux. Ça demande un
   peu de travail de branchement, mais évite à tout le monde de toucher au
   code.

## Développement local

```bash
npm install
npm run dev
```

## Déploiement

Le workflow `.github/workflows/deploy.yml` build et déploie automatiquement
sur GitHub Pages à chaque push sur `main`. Il faut activer Pages sur le repo
GitHub en source "GitHub Actions" (Settings → Pages).

Le `base` dans `vite.config.ts` est réglé sur `/vls2-site/` — à adapter si
le repo est créé sous un autre nom.

## Photos et vidéos

Pas encore intégré au site. Pour l'instant, la voie la plus simple reste
d'envoyer les fichiers directement à Claude en précisant le match ou la
séance concernée, pour avoir un retour d'analyse.
