# Changelog - Application de Gestion de Commandes Interne

## [Version 0.4.6] - 2025-04-02

### Améliorations
- Modification de la recherche pour filtrer les commandes dont la référence contient la valeur saisie
- Filtrage en temps réel au fur et à mesure de la saisie
- Suppression de l'appel API pour rechercher une commande spécifique
- Amélioration des messages d'erreur lorsqu'aucune commande ne correspond au filtre

## [Version 0.4.5] - 2025-04-02

### Améliorations
- Simplification de la recherche par référence pour accepter tous les formats de référence
- Vérification minimale : la référence ne doit pas être vide
- Suppression des espaces avant/après avec trim()
- Envoi de la référence exactement comme elle a été tapée à l'API
- Amélioration de l'interface utilisateur de la barre de recherche

## [Version 0.4.4] - 2025-04-02

### Améliorations
- Amélioration de la recherche par référence pour accepter différents formats (avec ou sans "CMD-")
- Formatage automatique des références numériques (ajout du préfixe "CMD-")
- Messages d'erreur plus précis lors de la recherche de commandes
- Gestion des cas particuliers comme la saisie de "CMD" sans numéro

## [Version 0.4.3] - 2025-04-02

### Modifications
- Suppression de la fonctionnalité de sélection d'une ligne dans le tableau des commandes
- Retrait du formulaire de préparation qui apparaissait en bas du tableau
- Simplification de l'interface utilisateur pour une meilleure lisibilité

## [Version 0.4.2] - 2025-04-02

### Améliorations
- Ajout d'un indicateur visuel pour informer les agents qu'ils ne voient que leurs propres commandes
- Amélioration des messages d'erreur lors de la recherche de commandes inaccessibles
- Messages plus précis en fonction du type d'erreur (commande non trouvée, accès refusé)

## [Version 0.4.1] - 2025-04-02

### Corrections
- Correction de l'initialisation des états dans le formulaire de préparation
- Mise à jour des URL d'API pour correspondre aux routes du backend
- Amélioration de la gestion des dates invalides ou nulles
- Correction de la gestion du token d'authentification dans les requêtes API
- Installation de la dépendance date-fns pour le formatage des dates

## [Version 0.4.0] - 2025-04-02

### Ajouts
- Implémentation complète du module de préparation des commandes
- Création du composant `OrdersList` pour afficher la liste des commandes à préparer
- Création du composant `PreparationForm` pour saisir le nombre de lignes par commande
- Ajout d'un service `orderService` pour gérer les appels API liés aux commandes
- Ajout d'une nouvelle route API pour rechercher une commande par référence

### Modifications
- Mise à jour des routes API pour les actions de préparation, contrôle et emballage
- Amélioration de la page de préparation avec une interface en deux colonnes (liste et formulaire)
- Ajout de la pagination pour la liste des commandes

### Améliorations
- Gestion des états de chargement, d'erreur et de succès pour une meilleure expérience utilisateur
- Affichage de messages d'information contextuels selon le résultat des opérations
- Validation des données saisies dans le formulaire de préparation

## [Version 0.3.0] - 2025-04-02

### Ajouts
- Création d'un composant réutilisable `OrderSearchBar` pour la recherche de commandes par référence
- Intégration de la barre de recherche dans les pages des modules (préparation, contrôle, emballage)
- Ajout d'un état local pour gérer les termes de recherche dans chaque module

### Modifications
- Suppression de la barre de recherche de la barre de navigation principale
- Déplacement de la fonctionnalité de recherche directement dans les pages des modules concernés
- Ajout d'un séparateur (Divider) après la barre de recherche pour une meilleure lisibilité

### Améliorations
- Amélioration de l'expérience utilisateur en plaçant la recherche directement dans le contexte d'utilisation
- Ajout d'un bouton de réinitialisation (clear) dans la barre de recherche
- Affichage conditionnel des résultats de recherche

## [Version 0.2.0] - 2025-04-02

### Ajouts
- Création de pages de base pour tous les modules (préparation, contrôle, emballage, statistiques, gestion des utilisateurs)
- Ajout d'un bouton de retour à l'accueil sur toutes les pages des modules
- Implémentation d'un composant réutilisable `BackToHomeButton` avec une icône de flèche

### Modifications
- Redesign du tableau de bord pour afficher les modules accessibles selon le rôle de l'utilisateur
- Amélioration de l'alignement des modules dans le tableau de bord
- Ajout d'une marge à gauche sur les pages des modules pour éviter le chevauchement avec le bouton de retour
- Optimisation de la mise en page pour une meilleure expérience utilisateur

### Corrections
- Correction de l'affichage du bouton de retour pour qu'il soit visible sous la barre de navigation
- Ajustement de la position des éléments pour éviter les chevauchements

## [Version 0.1.0] - 2025-04-01

### Ajouts
- Implémentation du modèle `Order` avec un champ `line_count` pour suivre le nombre d'articles dans chaque commande
- Mise à jour des sérialiseurs pour inclure le nouveau champ `line_count`
- Modification du script `create_test_data.py` pour générer des données de test avec des valeurs aléatoires pour `line_count`

### Modifications
- Suppression de la fonctionnalité de notification (icône de cloche) du composant `AppLayout`
- Mise à jour de la vue `PreparationView` pour gérer le champ `line_count` lors de la préparation d'une commande

### Améliorations techniques
- Utilisation de JWT pour l'authentification des utilisateurs
- Restriction de l'accès à certaines routes en fonction des rôles des utilisateurs
