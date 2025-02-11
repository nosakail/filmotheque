# IUT Project - API REST

Ce projet est une API REST développée avec Hapi.js et MySQL.

## Prérequis

- Node.js
- Docker
- npm

## Installation et démarrage

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de la base de données

Lancez le conteneur MySQL avec Docker :

```bash
sudo docker run -d --name hapi-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=hapi \
  -e MYSQL_DATABASE=user \
  mysql:8.0 \
  --default-authentication-plugin=mysql_native_password
```

### 3. Démarrage du serveur

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

## Routes principales

- POST `/user` : Création d'un utilisateur
- GET `/users` : Liste des utilisateurs 
- PATCH `/user/{id}` : Modification d'un utilisateur 
- DELETE `/user/{id}` : Suppression d'un utilisateur 
- POST `/user/login` : Connexion d'un utilisateur
