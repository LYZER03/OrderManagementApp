# Changelog - Application de Gestion de Commandes Interne

## [Version 0.10.0] - 2025-04-17

### Nouvelles fonctionnalités et améliorations
- Ajout d'une barre de recherche dynamique par référence : filtrage instantané sur toutes les commandes, non affecté par la date ou les filtres statut/créateur.
- Correction du bug de focus sur la barre de recherche (plus besoin de cliquer à chaque caractère).
- Ajout d'un bouton "Réinitialiser les filtres" toujours visible dans la table des commandes.
- Amélioration de l'expérience utilisateur sur le filtrage par statut (chips toujours visibles).
- Suppression du bouton filtre redondant à côté du bouton supprimer.
- Correction de l'affichage des dates avec la locale française (plus de "date invalide").
- Corrections et harmonisation mineures de l'UI/UX.


## [Version 0.9.0] - 2025-04-15

### Optimisations de performance
- Implémentation du filtrage par date côté serveur pour réduire le temps de chargement initial
- Limitation par défaut des données chargées aux commandes du jour uniquement
- Optimisation des requêtes API pour supporter les filtres de plage de dates
- Amélioration des performances pour les grands volumes de données

### Améliorations de l'interface utilisateur
- Centralisation de tous les filtres dans un panneau unique et cohérent
- Ajout d'un filtre par créateur de commande dans le tableau des commandes
- Implémentation d'un sélecteur de plage de dates (date de début et date de fin)
- Simplification de l'interface utilisateur en supprimant les filtres redondants
- Amélioration de la cohérence visuelle entre les différents modules

### Nouveaux outils
- Création d'un script pour générer de grands jeux de données de test
- Ajout d'options pour générer des commandes historiques ou du jour
- Création d'un script pour supprimer toutes les commandes de la base de données
- Amélioration des outils de développement pour faciliter les tests

### Corrections
- Correction des problèmes d'affichage dans le sélecteur de date personnalisée
- Harmonisation de l'affichage des noms de créateurs dans les filtres et les tableaux
- Suppression des indicateurs redondants "Commandes d'aujourd'hui uniquement"
- Correction de divers bugs mineurs d'interface utilisateur

## [Version 0.8.1] - 2025-04-13

### Améliorations
- Remplacement des données fictives par des données réelles pour les graphiques de commandes mensuelles
- Remplacement des données fictives par des données réelles pour les graphiques de commandes emballées
- Correction de l'affichage des noms d'agents dans le tableau des commandes récentes
- Amélioration des sous-titres des graphiques pour afficher des informations dynamiques basées sur les données réelles
- Modification de la disposition de la légende du graphique en camembert (vertical à droite)
- Suppression du texte "4 Statuts" au centre du graphique en camembert pour une meilleure lisibilité

### Corrections
- Correction des problèmes d'affichage sur les appareils mobiles
- Ajout de la définition de la variable isMobile dans tous les composants de statistiques
- Correction des références aux variables non définies dans le composant PieChartCard

## [Version 0.8.0] - 2025-04-13

### Ajouts
- Implémentation complète du module "Statistiques" avec des graphiques interactifs et tableaux de bord
- Création de cartes statistiques pour afficher les indicateurs clés de performance
- Ajout de graphiques à barres, linéaires et circulaires pour visualiser les données
- Implémentation de tableaux pour la performance des agents et les commandes récentes
- Intégration de la bibliothèque Recharts pour des visualisations de données modernes

### Fonctionnalités statistiques
- Affichage du nombre de commandes par statut (Créées, Préparées, Contrôlées, Emballées)
- Visualisation du temps moyen de traitement par étape (Préparation, Contrôle, Emballage)
- Analyse de la performance des agents (commandes traitées, temps moyen, évaluation)
- Présentation des tendances de ventes quotidiennes et des visites du site
- Suivi des tâches complétées et de la croissance globale

### Améliorations techniques
- Architecture de composants réutilisables pour les différents types de graphiques
- Mise en place d'un service dédié aux statistiques avec des données fictives
- Interface responsive adaptée à tous les appareils (mobile, tablette, desktop)
- Optimisation du chargement des données avec Promise.all pour les requêtes parallèles

## [Version 0.7.0] - 2025-04-13

### Ajouts
- Implémentation complète du module "Gestion des utilisateurs" pour les managers
- Création d'une interface de liste des utilisateurs avec filtrage et recherche
- Ajout d'un formulaire de création et modification des comptes utilisateurs
- Implémentation des fonctionnalités d'attribution des rôles (Agent/Manager)
- Ajout de la gestion des permissions basée sur les rôles
- Création d'une API complète pour la gestion des utilisateurs (CRUD)

### Améliorations
- Interface utilisateur responsive adaptée aux différentes tailles d'écran
- Validation des formulaires côté client et côté serveur
- Messages de confirmation et d'erreur contextuels
- Gestion sécurisée des mots de passe (hachage côté serveur)
- Protection contre la suppression de son propre compte
- Protection contre la modification de son propre rôle

### Modifications techniques
- Ajout de nouvelles routes API pour la gestion des utilisateurs
- Implémentation de contrôles d'accès basés sur les rôles pour toutes les opérations
- Optimisation des requêtes avec pagination et filtrage côté client

## [Version 0.6.0] - 2025-04-13

### Ajouts
- Création d'un nouveau module "Table des commandes" exclusivement pour les managers
- Ajout d'un filtrage avancé par date et par statut dans la table des commandes
- Implémentation de la sélection multiple et suppression groupée de commandes
- Ajout d'une vue détaillée pour chaque commande avec toutes les informations de son cycle de vie
- Intégration du module "Table des commandes" dans le menu latéral et sur le tableau de bord

### Modifications
- Modification des vues backend pour permettre aux agents de voir toutes les commandes à contrôler, quel que soit le préparateur
- Modification des vues backend pour permettre aux agents de voir toutes les commandes à emballer, quel que soit le contrôleur
- Changement de la couleur du statut "Emballée" de bleu à violet pour une meilleure distinction visuelle

### Améliorations
- Amélioration de l'interface de filtrage pour maintenir les contrôles visibles même lorsqu'aucun résultat n'est trouvé
- Optimisation de l'expérience utilisateur avec des messages clairs et des actions contextuelles
- Meilleure gestion des états vides et des messages d'information

## [Version 0.5.0] - 2025-04-13

### Améliorations UI/UX
- Refonte complète de l'interface utilisateur avec un design moderne et épuré
- Modification de la barre latérale pour un style flottant avec coins arrondis
- Remplacement du logo "Material Dashboard 2" par le logo GFC
- Changement de la couleur de fond de la barre latérale en gris (#424242)
- Uniformisation des couleurs de fond pour tous les éléments de l'interface
- Amélioration du contraste et de la lisibilité des éléments de menu
- Optimisation de l'affichage en mode mobile
- Suppression des ombres inutiles pour un design plus plat et moderne

### Modifications techniques
- Restructuration des composants Paper pour utiliser la pleine largeur de l'écran
- Ajustement des marges et des espacements pour une meilleure utilisation de l'espace
- Amélioration de la cohérence visuelle entre les différentes pages de l'application

## [Version 0.4.8] - 2025-04-03

### Ajouts
- Ajout d'une colonne "Lignes" dans le tableau des commandes pour afficher le nombre de lignes
- Ajout d'une colonne "Actions" avec des boutons pour valider et modifier les commandes
- Création d'un formulaire de modification des commandes
- Création d'un formulaire de validation des commandes
- Ajout d'une méthode dans le service orderService pour mettre à jour une commande

### Améliorations
- Amélioration de l'interface utilisateur avec des icônes et des tooltips
- Validation des données avant soumission des formulaires

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
