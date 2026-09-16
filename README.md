# VLS 2 — Suivi d'équipe

Site de suivi pour l'équipe VLS 2 : résultats de matchs, compositions par
set/poste, et quelques statistiques de base. Stack : React + TypeScript +
Vite, déployé sur GitHub Pages via GitHub Actions, données stockées dans
Supabase (Postgres) avec mise à jour en temps réel entre tous les
visiteurs.

## Fonctionnement des données

Toutes les données (effectif, matchs, compositions) sont dans une base
Supabase, pas dans des fichiers du repo. Les saisies et modifications
faites depuis le site (onglet Équipe, "+ Nouveau match", "Modifier" sur un
set) s'enregistrent directement en base et sont visibles par tout le monde
en quasi temps réel, sans commit ni push.

- Client Supabase : `src/supabaseClient.ts`
- Lecture / écriture / abonnement temps réel : `src/api.ts`
- Schéma des tables (`joueuses`, `matches`, `compositions`) : voir le
  projet Supabase, section SQL Editor / Table Editor

⚠️ La clé utilisée (`anon public`) est volontairement publique — c'est la
clé prévue pour être exposée côté client chez Supabase. La sécurité repose
sur les policies RLS, actuellement réglées en accès libre (n'importe qui
avec le lien du site peut lire et écrire). Si l'équipe grandit ou si le
site devient plus visible, il faudra resserrer ces policies (mot de passe
partagé, authentification par joueuse, etc.).

## Schéma de données

Décrit dans `src/types.ts` :

- **Joueuse** — nom, numéro, `posteCle` (poste attribué pour la saison),
  `autresPostes` (postes secondaires, optionnel), `numeroLicence`
  (optionnel).
- **Match** — date, adversaire, domicile/extérieur, lieu, score de chaque
  set joué.
- **CompositionSet** — une entrée par set joué, avec les 6 positions du
  terrain (P1 à P6, numérotation rotation volley) et pour chacune : la
  joueuse et le poste réellement joué ce set-là (`posteJoue`), qui peut
  différer du `posteCle` de la joueuse.

## Développement local

```bash
npm install
npm run dev
```

## Déploiement

Le workflow `.github/workflows/deploy.yml` build et déploie automatiquement
sur GitHub Pages à chaque push sur `main`. Le `base` dans `vite.config.ts`
est réglé sur `/vls2-site/`.

## Photos et vidéos

Pas encore intégré au site. Pour l'instant, la voie la plus simple reste
d'envoyer les fichiers directement à Claude en précisant le match ou la
séance concernée, pour avoir un retour d'analyse.
