# Guide de développement

## Prérequis

Avant de démarrer le projet, assurez-vous d’avoir installé :
- Node.js
- pnpm
- un backend compatible exposant les routes /api/admin/*

## Installation

Depuis la racine du projet :

```bash
pnpm install
```

## Variables d’environnement

Créer un fichier .env.local si nécessaire avec :

```env
VITE_API_URL=http://localhost:5000/api
```

Si vous utilisez le proxy Vite par défaut, l’application pourra aussi appeler /api et rediriger vers localhost:5000.

## Démarrage en développement

```bash
pnpm dev
```

Le serveur Vite démarre généralement sur le port 5175.

## Build de production

```bash
pnpm build
```

## Vérifications

```bash
pnpm lint
pnpm test
```

## Workflow de développement recommandé

1. Travailler dans les écrans du dossier src/pages.
2. Ajouter ou ajuster les mutations/queries dans src/api.
3. Vérifier les traductions dans src/i18n/locales.
4. Tester les flux critiques : connexion, gestion des organisations, documents, scores, conformité.
5. Lancer la build avant de livrer une modification.

## Bonnes pratiques observées dans le projet

- Séparer clairement les écrans et les modules API par domaine.
- Utiliser les composants React fonctionnels et hooks.
- Centraliser la logique d’authentification dans un contexte dédié.
- Favoriser les modales pour les actions sensibles.
- Garder les traductions dans les fichiers JSON de l’i18n.

## Points à surveiller

- Le backend doit fournir les routes attendues par les modules RTK Query.
- Les appels doivent être compatibles avec le token admin stocké dans le local storage.
- Les écrans sensibles doivent vérifier les droits de super admin si nécessaire.
