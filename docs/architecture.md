# Architecture du projet

## Vue d’ensemble

L’application suit une architecture front-end moderne en React avec une séparation claire entre :
- la couche de présentation (pages et composants)
- la couche d’état et d’accès aux données (Redux Toolkit + RTK Query)
- la couche d’authentification et de navigation

## Structure fonctionnelle

### 1. Entrée de l’application

Le point d’entrée se trouve dans [src/main.tsx](../src/main.tsx). Il initialise :
- le store Redux
- le provider Redux
- la configuration i18n
- l’application React

### 2. Routage

La configuration des routes se trouve dans [src/App.tsx](../src/App.tsx).

Routes principales :
- /login : page de connexion
- /dashboard : tableau de bord
- /organizations : gestion des organisations
- /organizations/:id : détail d’une organisation
- /users : gestion des utilisateurs
- /documents : revue des documents
- /trust-scores : gestion des scores de confiance
- /compliance : conformité
- /audit-logs : logs d’audit
- /alerts : alertes
- /system : surveillance système
- /admins : gestion des administrateurs

Le routage est protégé par un garde d’accès qui vérifie l’authentification admin.

### 3. Contexte d’authentification

Le contexte [src/context/AdminAuthContext.tsx](../src/context/AdminAuthContext.tsx) gère :
- l’état de l’admin connecté
- le token JWT stocké dans le local storage
- la méthode login
- la méthode logout
- la vérification automatique de l’authentification au démarrage

### 4. Layout global

Le layout principal [src/components/layout/AdminLayout.tsx](../src/components/layout/AdminLayout.tsx) fournit :
- la side bar de navigation
- le header utilisateur
- la bascule FR/EN
- le bouton de déconnexion
- le rendu des routes enfant via Outlet

### 5. Gestion des données

Les données sont récupérées via RTK Query, organisé par domaine dans [src/api](../src/api).

Les modules principaux sont :
- adminAuthApi : gestion de l’authentification
- adminAnalyticsApi : métriques et KPI du dashboard
- adminOrgsApi : organisations
- adminUsersApi : utilisateurs
- adminDocumentsApi : documents et validation
- adminTrustApi : scores et historique
- adminComplianceApi : conformité
- adminAuditApi : logs d’audit
- adminAlertsApi : alertes
- adminSystemApi : santé système
- adminAdminsApi : gestion des admins

### 6. Internationalisation

La traduction est centralisée dans [src/i18n](../src/i18n). Le projet supporte actuellement :
- français (par défaut)
- anglais

### 7. UI et styles

Le style est géré avec Tailwind CSS et des composants React modernes. Les écrans utilisent des cartes, des tableaux, des modales et des états de chargement cohérents.

## Flux de données typique

1. L’utilisateur se connecte.
2. Le token est stocké localement.
3. Les pages utilisent des hooks RTK Query pour charger les données depuis l’API backend.
4. Les mutations modifient les données via l’API et mettent à jour l’interface.
5. Les pages affichent les résultats dans des tableaux, graphiques ou cartes.

## Configuration d’environnement

Le front utilise la variable d’environnement :
- VITE_API_URL : URL de base de l’API backend

En développement, Vite proxy aussi les appels /api vers l’API locale sur le port 5000.
