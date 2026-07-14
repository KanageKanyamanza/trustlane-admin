# API et intégration

## Approche générale

Le front-end communique avec un backend via RTK Query. La base d’URL est construite dans [src/api/apiSlice.ts](../src/api/apiSlice.ts).

Le comportement principal est le suivant :
- la base est définie à partir de VITE_API_URL ou d’un fallback /api
- chaque requête ajoute automatiquement le Bearer token admin si présent dans le local storage
- les modules API sont séparés par domaine métier

## Modules API principaux

### Authentification
Responsable de la connexion, de la vérification du token et de la déconnexion de l’admin.

### Analytics
Fournit les données nécessaires au tableau de bord : KPI, inscriptions, documents par statut et répartition des Trust Scores.

### Organisations
Permet la liste, la recherche, la suspension et l’accès aux détails d’une organisation.

### Utilisateurs
Gère la liste des utilisateurs, le blocage, la déblocage et la réinitialisation du mot de passe.

### Documents
Permet la consultation des documents soumis, leur validation, leur rejet et leur téléchargement.

### Trust Scores
Expose les scores et les actions associées : override, recalcul, historique.

### Conformité
Permet la lecture et la mise à jour des templates de conformité ainsi que le suivi des checklists.

### Audit
Centralise les logs d’activité administrateur.

### Alertes
Exporte les alertes critiques liées au système et à la plateforme.

### Système
Fournit l’état du backend, les métriques Redis et la possibilité de vider le cache.

### Admins
Permet la gestion des comptes administrateurs, y compris la création et la suppression pour les super admins.

## Bonnes pratiques d’intégration

- Toujours passer par les modules RTK Query plutôt que par des appels fetch dispersés.
- Utiliser les tags et invalidations lorsque les modifications doivent mettre à jour plusieurs vues.
- Éviter les accès non protégés aux routes sensibles.
- Gérer les erreurs réseau et les états de chargement dans les écrans.
