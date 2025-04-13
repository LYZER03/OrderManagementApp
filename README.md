# Application de Gestion de Commandes Interne

Une application complète pour gérer le processus de traitement des commandes, depuis la préparation jusqu'à l'emballage, avec un tableau de bord pour les managers.

## Architecture

L'application est divisée en deux parties principales :

### Backend (Django)

- **Framework** : Django avec Django REST Framework
- **Base de données** : PostgreSQL via Supabase (migration depuis SQLite)
- **Authentification** : JWT (JSON Web Tokens)
- **Sécurité** : Protection CSRF, gestion des sessions, permissions basées sur les rôles

### Frontend (React.js)

- **Framework** : React.js
- **UI** : Interface utilisateur moderne et responsive
- **État** : Gestion d'état avec Context API ou Redux
- **Routing** : React Router pour la navigation

## Fonctionnalités

### Système d'authentification

- **Rôles** : 
  - Agents : Accès limité aux modules Préparation, Contrôle et Emballage
  - Managers : Accès complet incluant dashboard administratif
- **Sécurité** : 
  - Gestion des sessions
  - Protection contre les injections SQL
  - Protection CSRF
  - Gestion des permissions basée sur les rôles

### Module Préparation

- Tableau des commandes en attente de préparation
- Barre de recherche par numéro de référence
- Formulaire d'ajout de nouvelles commandes
- Boutons d'action : Valider/Modifier/Supprimer
- Restriction de visibilité : agents limités à leurs propres commandes

### Module Contrôle

- Tableau des commandes préparées en attente de contrôle
- Barre de recherche par numéro de référence
- Bouton "Valider le contrôle" (désactivé si non préparé)
- Calcul automatique du temps de préparation

### Module Emballage

- Tableau des commandes contrôlées en attente d'emballage
- Barre de recherche par numéro de référence
- Bouton "Valider l'emballage" (désactivé si non contrôlé)
- Calcul automatique du temps de contrôle

### Dashboard Manager

- KPIs globaux (nombre total de commandes, temps moyens)
- Monitoring des agents (liste des agents, charge de travail)
- Visualisations graphiques (performance des équipes, évolution dans le temps)
- Filtres temporels (jour/semaine/mois)

## Installation

### Prérequis

- Python 3.8+
- Node.js 14+
- npm ou yarn

### Backend

1. Cloner le dépôt
   ```
   git clone <url-du-repo>
   cd OrderManagementApp/backend
   ```

2. Créer un environnement virtuel
   ```
   python -m venv venv
   ```

3. Activer l'environnement virtuel
   - Windows : `venv\Scripts\activate`
   - Linux/Mac : `source venv/bin/activate`

4. Installer les dépendances
   ```
   pip install -r requirements.txt
   ```

5. Configuration du fichier .env
   
   Créez un fichier `.env` dans le dossier `backend` avec les variables suivantes :

   ```
   # Configuration Django
   SECRET_KEY=votre_clé_secrète_django
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,192.168.1.16

   # Configuration de la base de données PostgreSQL (Supabase)
   DATABASE_URL=postgres://user:password@host:port/database
   
   # Si vous préférez configurer manuellement :
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=nom_de_votre_base
   DB_USER=utilisateur_db
   DB_PASSWORD=mot_de_passe_db
   DB_HOST=host_db
   DB_PORT=5432

   # Configuration JWT
   JWT_SECRET_KEY=votre_clé_secrète_jwt
   JWT_ALGORITHM=HS256
   JWT_ACCESS_TOKEN_LIFETIME=24
   JWT_REFRESH_TOKEN_LIFETIME=7
   ```

   **Note importante :** Ne jamais commiter ce fichier dans Git. Il est déjà inclus dans le `.gitignore`.

6. Appliquer les migrations
   ```
   python manage.py migrate
   ```

6. Créer des données de test (optionnel)
   ```
   python create_test_data.py
   ```

7. Lancer le serveur
   ```
   python manage.py runserver
   ```

### Frontend

1. Naviguer vers le dossier frontend
   ```
   cd ../frontend
   ```

2. Installer les dépendances
   ```
   npm install
   ```

3. Configuration du fichier .env (optionnel)
   
   Si vous souhaitez personnaliser l'URL de l'API ou d'autres paramètres, créez un fichier `.env` dans le dossier `frontend` :

   ```
   # URL de l'API backend
   REACT_APP_API_URL=http://localhost:8000/api
   
   # Autres configurations
   REACT_APP_ENABLE_MOCK_DATA=false
   REACT_APP_DEFAULT_PAGE_SIZE=20
   ```

4. Lancer l'application
   ```
   npm start
   ```

   Pour rendre l'application accessible depuis d'autres appareils sur le réseau local :
   ```
   npm start -- --host 0.0.0.0
   ```

## Utilisation

### Comptes de test

L'application est préchargée avec les comptes de test suivants :

**Managers :**
- Identifiant : manager1 / Mot de passe : password123
- Identifiant : manager2 / Mot de passe : password123

**Agents :**
- Identifiant : agent1 / Mot de passe : password123
- Identifiant : agent2 / Mot de passe : password123
- Identifiant : agent3 / Mot de passe : password123
- Identifiant : agent4 / Mot de passe : password123
- Identifiant : agent5 / Mot de passe : password123

### Flux de travail typique

1. Un agent crée une nouvelle commande dans le module Préparation
2. L'agent prépare la commande et valide la préparation
3. Un agent (le même ou un autre) contrôle la commande et valide le contrôle
4. Un agent (le même ou un autre) emballe la commande et valide l'emballage
5. Les managers peuvent suivre l'ensemble du processus via le dashboard

## API Endpoints

### Authentification

- `POST /api/auth/register/` : Créer un nouvel utilisateur
- `POST /api/auth/login/` : Se connecter et obtenir un token JWT
- `POST /api/auth/token/refresh/` : Rafraîchir un token JWT
- `GET /api/auth/user/` : Obtenir les informations de l'utilisateur connecté
- `GET /api/auth/users/` : Obtenir la liste des utilisateurs (managers uniquement)

### Commandes

- `GET /api/orders/` : Obtenir la liste des commandes
- `POST /api/orders/` : Créer une nouvelle commande
- `GET /api/orders/<id>/` : Obtenir les détails d'une commande
- `PUT /api/orders/<id>/` : Mettre à jour une commande
- `DELETE /api/orders/<id>/` : Supprimer une commande

### Modules spécifiques

- `GET /api/orders/preparation/` : Obtenir les commandes en attente de préparation
- `POST /api/orders/preparation/<id>/validate/` : Valider la préparation d'une commande

- `GET /api/orders/control/` : Obtenir les commandes en attente de contrôle
- `POST /api/orders/control/<id>/validate/` : Valider le contrôle d'une commande

- `GET /api/orders/packing/` : Obtenir les commandes en attente d'emballage
- `POST /api/orders/packing/<id>/validate/` : Valider l'emballage d'une commande

### Dashboard

- `GET /api/orders/dashboard/` : Obtenir les statistiques pour le dashboard (managers uniquement)

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
