# Fonctionnalités du projet

## 1. Authentification et sécurité

L’application dispose d’un flux d’authentification administrateur basé sur un token stocké localement.

Fonctionnalités principales :
- Connexion avec email et mot de passe
- Vérification automatique du token au chargement
- Déconnexion propre
- Protection des routes avec un garde d’accès
- Gestion différenciée des droits selon le rôle Super Admin

## 2. Tableau de bord

La page d’accueil fournit une vue globale de la plateforme.

Éléments visibles :
- KPI généraux : organisations, utilisateurs, documents en attente, score moyen
- Alertes critiques si des éléments nécessitent une action rapide
- Graphiques mensuels d’inscriptions
- Répartition des documents par statut
- Distribution des Trust Scores
- Résumé rapide de la plateforme

## 3. Gestion des organisations

La section organisations permet de surveiller et d’agir sur les organisations enregistrées.

Fonctionnalités :
- Liste paginée des organisations
- Recherche par mot-clé
- Visualisation du propriétaire associé
- Affichage du Trust Score actuel
- Statut actif / suspendu
- Suspension ou réactivation d’une organisation
- Accès à la vue détaillée d’une organisation

## 4. Gestion des utilisateurs

La page utilisateurs permet de superviser les comptes utilisateurs.

Fonctionnalités :
- Recherche d’un utilisateur
- Filtrage par rôle
- Pagination
- Affichage du rôle, de l’organisation et du statut
- Blocage / déblocage d’un utilisateur
- Réinitialisation du mot de passe pour les administrateurs autorisés
- Affichage d’un mot de passe temporaire dans une modale

## 5. Validation des documents

La page de revue des documents permet aux administrateurs de traiter les documents soumis.

Fonctionnalités :
- Liste des documents en attente de validation
- Prévisualisation du document
- Téléchargement direct du fichier
- Validation d’un document
- Rejet avec motif explicite
- Modale de rejet avec saisie de texte

## 6. Gestion des Trust Scores

Cette section permet de superviser la réputation et la confiance attribuée aux organisations.

Fonctionnalités :
- Liste de tous les scores de confiance
- Conversion en grade visuel (AAA, AA, A, BBB, BB, B)
- Affichage des codes de motif associés
- Historique de l’évolution d’un score sur une courbe
- Surcharge manuelle d’un score avec justification obligatoire
- Recalcul automatique d’un score

## 7. Conformité

La page conformité centralise les exigences et le suivi des contrôles par marché.

Fonctionnalités :
- Onglets pour les templates, les checklists et les statistiques
- Édition des exigences de conformité par template
- Consultation des checklists par organisation
- Suivi du statut des exigences : PASS, FAIL, IN_REVIEW, MISSING
- Calcul du pourcentage de conformité par marché

## 8. Journal d’audit

La page audit permet de consulter l’historique des actions importantes effectuées dans l’admin panel.

Fonctionnalités :
- Liste paginée des événements
- Affichage de l’action, de l’entité concernée, de l’utilisateur/admin et de l’organisation
- Export CSV vers l’API backend

## 9. Alertes

La section alertes permet de suivre les événements critiques et de les traiter.

Fonctionnalités :
- Liste des alertes non acquittées
- Différenciation par gravité : CRITICAL, WARN, INFO
- Acquittement d’une alerte
- Affichage de l’organisation liée à l’alerte

## 10. Surveillance système

La page système fournit un aperçu de la santé technique de l’infrastructure.

Fonctionnalités :
- Vérification de l’état du backend, de la base et de Redis
- Affichage de l’uptime
- Statistiques Redis : mémoire utilisée, clés totales, clients connectés
- Vidage du cache, réservé aux super administrateurs

## 11. Gestion des administrateurs

La page administrateurs est réservée aux super administrateurs.

Fonctionnalités :
- Liste des administrateurs existants
- Création d’un nouvel administrateur
- Définition du rôle Super Admin ou Admin
- Suppression d’un administrateur non courant
- Protection de l’admin connecté

## 12. Interface utilisateur et expérience

Au-delà des modules métiers, l’interface propose :
- une navigation latérale fixe
- une langue FR/EN configurable
- des modales pour les actions sensibles
- une mise en page responsive adaptée aux écrans de bureau
- des composants d’état de chargement et d’erreurs
