# IUT Project - API REST

Ce projet est une API REST développée avec Hapi.js et MySQL.

## Prérequis

- Node.js
- Docker
- npm

## Installation et démarrage

### 1. Se placer dans le bon répertoire

```bash
cd iut-nodejs-tp/iut-project
```

### 2. Installation des dépendances

```bash
npm install
```

### 3. Configuration de la base de données

Créez un fichier `.env` dans le dossier `server/` avec le contenu suivant :

```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=hapi
DB_NAME=user
DB_PORT=3306

# Configuration SMTP pour l'envoi d'emails
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=    # Générer sur https://ethereal.email
SMTP_PASSWORD= # Générer sur https://ethereal.email
```

Pour obtenir les identifiants SMTP :
1. Visitez https://ethereal.email
2. Cliquez sur "Create Ethereal Account"
3. Copiez les identifiants générés dans votre fichier .env

Ensuite, lancez le conteneur MySQL avec Docker :

```bash
sudo docker run -d --name hapi-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=hapi \
  -e MYSQL_DATABASE=user \
  mysql:8.0 \
  --default-authentication-plugin=mysql_native_password
```

### 4. Configuration de RabbitMQ

L'application utilise RabbitMQ pour la gestion des tâches asynchrones (export CSV des films).

Pour accéder à l'interface de gestion RabbitMQ :
1. Activez le plugin de gestion :
```bash
sudo rabbitmq-plugins enable rabbitmq_management
```

2. Créez un utilisateur admin :
```bash
sudo rabbitmqctl add_user admin admin
sudo rabbitmqctl set_user_tags admin administrator
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
```

3. Accédez à l'interface de gestion :
- URL : http://localhost:15672
- Username : admin
- Password : admin

### 5. Démarrage du serveur

```bash
npm start
```

## Documentation de l'API

Une fois le serveur démarré, vous pouvez accéder à la documentation Swagger de l'API à l'adresse suivante :

```
http://localhost:3000/documentation
```

Cette interface vous permettra de :
- Explorer toutes les routes disponibles
- Tester les différents endpoints
- Voir les schémas de données attendus
- Comprendre les différentes réponses possibles

### Authentification pour les routes protégées

Certaines routes nécessitent une authentification. Pour utiliser ces routes dans la documentation Swagger :

1. Connectez-vous d'abord via la route `/user/login` pour obtenir un token JWT
2. Dans la section "Available Authorizations" de Swagger (en haut de la page), entrez votre token au format :
   ```
   Bearer <votre_token>
   ```
   Exemple :
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Cliquez sur "Authorize" pour sauvegarder le token
4. Vous pouvez maintenant tester les routes protégées

## Routes principales

- POST `/user` : Création d'un utilisateur
- GET `/users` : Liste des utilisateurs 
- PATCH `/user/{id}` : Modification d'un utilisateur 
- DELETE `/user/{id}` : Suppression d'un utilisateur 
- POST `/user/login` : Connexion d'un utilisateur
