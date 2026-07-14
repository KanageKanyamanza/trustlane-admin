# Documentation TrustLane Admin

## Vue d’ensemble

TrustLane Admin est une application web de type tableau de bord administratif développée avec React, TypeScript, Vite et Redux Toolkit. Elle permet de superviser l’écosystème TrustLane depuis une interface unique : gestion des organisations, utilisateurs, documents, scores de confiance, conformité, alertes, santé système et administrateurs.

L’application est conçue pour un usage interne, avec une authentification dédiée, des écrans de gestion, des modales d’action, une navigation par onglets et une prise en charge de l’internationalisation française/anglais.

## Objectifs du projet

- Centraliser la surveillance de la plateforme TrustLane.
- Permettre aux administrateurs de gérer les entités critiques du système.
- Offrir une interface rapide et claire pour valider des documents, ajuster des scores et consulter les traces d’audit.
- Proposer des actions sensibles avec contrôle d’accès, notamment pour les super administrateurs.

## Stack technique

- React 18 + TypeScript
- Vite pour le tooling et le développement local
- React Router pour la navigation
- Redux Toolkit + RTK Query pour la gestion d’état et les appels API
- Tailwind CSS pour le style
- Recharts pour les graphiques
- i18next pour la traduction FR/EN
- Framer Motion et Lucide React pour les animations et icônes

## Structure du projet

```text
src/
  App.tsx                  # configuration des routes
  components/              # composants UI et layout
  context/                 # contexte d’authentification admin
  i18n/                    # configuration et traductions
  pages/                   # écrans de l’application
  api/                     # modules RTK Query par domaine
  store/                   # store Redux
```

## Documentation disponible

- [Fonctionnalités](features.md)
- [Architecture](architecture.md)
- [Développement](development.md)
- [API et intégration](api.md)
