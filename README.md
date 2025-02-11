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

Lancez le conteneur MySQL avec Docker :

```bash
sudo docker run -d --name hapi-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=hapi \
  -e MYSQL_DATABASE=user \
  mysql:8.0 \
  --default-authentication-plugin=mysql_native_password
```

### 4. Démarrage du serveur

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
