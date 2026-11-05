# Revue backend / frontend et plan d'évolution

**Rapport initial historique.** Les corrections appliqu?es et les r?sultats actuels sont dans [UPGRADE_NOTES.md](UPGRADE_NOTES.md).

Date : 4 novembre 2026. Périmètre : code Express/Mongoose et React/Vite présent dans ce dépôt.

## Conclusion

Le projet est une base d'authentification MERN avec inscription, vérification email, connexion, cookies JWT, renouvellement de session, récupération/changement du mot de passe, profil, changement d'email et suppression logique. Les couches routes/controllers/services/repositories sont séparées. Les rôles Client/Employer/Admin existent, mais les routes métier emploi et une administration complète ne sont pas implémentées.

La base est réutilisable, mais plusieurs défauts de sécurité et de fonctionnement doivent être corrigés avant une mise en production. Les problèmes prioritaires sont le contournement de la vérification email, les opérateurs MongoDB acceptés en entrée, la suppression logique mal contrôlée et la réponse de connexion incompatible avec le frontend.

Aucun code applicatif ni aucune dépendance du dépôt n'a été modifié pendant cette revue. Les installations et vérifications ont été exécutées sur une copie temporaire isolée. Aucun email réel ni aucune requête vers une base MongoDB n'a été envoyé.

## Vérifications effectuées et limites

- Installation frontend depuis le lockfile existant : réussie (`npm ci --ignore-scripts`).
- Build de production frontend : réussi, Vite 5.4.8, 1 796 modules, bundle JS 429,38 kB avant compression.
- ESLint : **76 erreurs et 1 avertissement**. Beaucoup concernent les imports inutilisés et les PropTypes ; il existe aussi une vraie référence indéfinie dans AuthProvider. Les erreurs de configuration Tailwind/CommonJS ne sont pas toutes des bugs exécutables.
- Sept assertions ciblées réussies avec les vrais modules applicatifs et Mongoose, mais des accès collection et un transport email simulés : deux requêtes acceptant des opérateurs, fuite du code d'inscription, réponse login sans user, acceptation d'un utilisateur supprimé par verifyToken, absence de `$unset` lors de la suppression, erreur de restauration.
- Backend installé depuis les plages du package.json, faute de lockfile : Mongoose résolu en 8.24.8. Ce résultat ne décrit pas une ancienne installation ou un serveur déployé.
- Pas de suite backend utilisable : `npm test` est un placeholder qui échoue volontairement. Pas de tests frontend déclarés.
- MongoDB réel, concurrence, livraison Mailtrap et parcours navigateur complets restent à tester lorsque la configuration sera disponible. Le succès du build ne valide pas les parcours d'authentification.

## Sécurité : priorité haute

### SEC-01 — La réponse d'inscription expose le code de vérification

**Références :** `backend/services/authService.js:48-67`, `backend/controllers/authController.js:35-42`, `backend/models/User.js:128-143`.

Le service retourne un objet créé avec `...user._doc`, en retirant seulement le mot de passe. Le document nouvellement créé contient encore `verificationToken`. Le contrôleur le sérialise directement : le filtre `toJSON` du modèle est contourné. Assertion confirmée sur la réponse JSON du vrai contrôleur, sauvegarde et email simulés.

**Impact :** une personne peut inscrire une adresse qu'elle ne contrôle pas puis utiliser le code de la réponse pour valider le compte sans ouvrir la boîte email.

**Correction :** définir un DTO explicite avec uniquement les champs publics, utiliser ce DTO pour toutes les réponses et tester qu'aucun secret n'est sérialisé. `select:false` n'efface pas un champ déjà présent sur un document créé ou modifié.

### SEC-02 — Des objets deviennent des opérateurs MongoDB dans les vérifications publiques

**Références :** `backend/controllers/authController.js:48-50,205-209`, `backend/repositories/userRepository.js:17-22,54-58`, `backend/routes/api/authRoutes.js:33,40`.

Le code/token reçu dans le JSON est inséré dans un filtre sans validation de type. Une valeur objet contenant un opérateur tel que `$ne` est conservée après le casting Mongoose. Les deux requêtes ont été exécutées jusqu'à la frontière collection simulée pour confirmer le filtre effectivement transmis.

**Impact :** la connaissance exacte d'un code ou d'un token n'est plus nécessaire pour sélectionner une demande non expirée. La vérification peut porter sur un compte arbitraire ; la confirmation d'email peut consommer une demande en attente sans posséder son token. L'exploitation complète sur un jeu de données réel n'a pas été exécutée.

**Correction :** validation stricte avant les repositories : code chaîne de six chiffres, token chaîne hexadécimale de longueur attendue, rejet des objets/tableaux et champs inconnus. Rattacher la vérification à une identité/demande précise et consommer le token atomiquement. La sanitisation des filtres est une protection supplémentaire, pas un remplacement de la validation des types.

### SEC-03 — Le middleware accepte potentiellement un compte supprimé

**Références :** `backend/middleware/verifyToken.js:24-26`, `backend/models/User.js:63-66`, `backend/services/authService.js:273-290`, `backend/repositories/userRepository.js:69-70`.

`isDeleted` est exclu par défaut, mais verifyToken lit `User.findById()` puis teste `user.isDeleted`. Le champ absent donne `undefined` et le contrôle passe. Confirmé avec une réponse collection respectant la projection Mongoose. Les services utilisant `findUserById` filtrent correctement les comptes supprimés ; toutes les routes ne sont donc pas contournées de la même manière. Le service de changement de mot de passe utilise une recherche sans filtre de suppression.

La suppression affecte également `undefined` aux secrets dans un update : Mongoose retire ces propriétés de la mise à jour au lieu d'effacer les anciennes valeurs en base. Absence de `$unset` confirmée. Cela peut laisser le hash et les anciens tokens stockés. Une ancienne demande de changement d'email pourrait aussi rester consultable, car son repository ne filtre pas `isDeleted`.

**Correction :** filtrer `isDeleted: {$ne:true}` dans chaque recherche d'authentification, utiliser `$unset` pour les secrets et révoquer les sessions. Tester une ancienne session après suppression sur toutes les routes sensibles.

### SEC-04 — Les sessions ne sont pas révoquées après changement/reset du mot de passe

**Références :** `backend/services/authService.js:169-182,217-235,293-309`, `backend/models/User.js:49-51,112-122`, `backend/middleware/verifyToken.js:15-34`.

`passwordChangedAt` et `changedPasswordAfter()` existent mais ne sont ni mis à jour ni utilisés. Les refresh tokens ne sont pas enregistrés, tournés ou révoqués. Logout efface uniquement les cookies du navigateur (`authService.js:138-140`). Un token déjà copié reste utilisable jusqu'à son expiration, même après récupération du compte.

**Correction :** sessions persistées avec refresh tokens hachés, rotation et détection de réutilisation ; révocation après reset, changement sensible et suppression. À défaut, une version de session vérifiée côté serveur doit invalider les anciens JWT.

### SEC-05 — Vérification et endpoints auth sans limite de tentatives

**Références :** `backend/app.js:10-23`, `backend/routes/api/authRoutes.js:25-51`, `backend/utils/verificationCode.js:1-3`, `backend/repositories/userRepository.js:17-22`.

Pas de limitation applicative des tentatives de login, vérification, renvoi ou récupération. Le code de six chiffres utilise Math.random(), reste valable 24 heures et est recherché globalement, sans email/identifiant de demande. Des collisions peuvent vérifier le mauvais compte.

**Correction :** génération cryptographique, code lié à une demande/utilisateur, durée plus courte, compteur d'essais et limites par IP et compte ; cooldown sur les emails. Un éventuel dispositif externe de limitation n'est pas visible dans ce dépôt.

## Sécurité : priorité moyenne

### SEC-06 — Réauthentification absente pour les opérations sensibles

**Références :** `backend/controllers/authController.js:145-149,220-224`, `backend/services/authService.js:262-290,359-390`.

Changement d'email et suppression de compte demandent seulement un cookie de session, sans mot de passe actuel ni preuve récente. Une session compromise suffit pour lancer ces actions.

**Correction :** demander une preuve récente, protéger les actions par une politique CSRF/origine adaptée au déploiement et notifier les changements. Les cookies actuels sont HttpOnly et SameSite strict : ce sont des protections utiles ; l'absence d'un token CSRF seul ne démontre pas une exploitation dans toutes les architectures.

### SEC-07 — Données et erreurs insuffisamment contrôlées

**Références :** `backend/services/authService.js:38-45,143-147,331-334`, `backend/middleware/errorHandler.js:4-9`, `backend/utils/emailService.js:19-21`, `backend/utils/emailTemplates.js:85`.

La vérification de présence ne valide pas les types ; certaines erreurs de validation deviennent des 500 et le message interne est renvoyé au client. Forgot-password et check-email révèlent l'existence d'un compte. Le nom est interpolé sans échappement dans le HTML d'accueil : risque d'injection de contenu dans l'email, sans preuve de XSS navigateur dans React.

**Correction :** schémas d'entrée communs, erreurs publiques contrôlées, réponse neutre à forgot-password, politique explicite pour check-email, échappement HTML des valeurs insérées dans les emails.

### SEC-08 — Dépendances signalées par npm audit et installations non reproductibles

**Références :** `frontend/package-lock.json`, `frontend/package.json:13-42`, `backend/package.json:18-35`, `backend/.gitignore:51-54`.

Résultats du registre npm au moment de la revue, incluant dépendances transitives et outils de développement :

| Installation analysée | Total | Critical | High | Moderate | Low |
| --- | ---: | ---: | ---: | ---: | ---: |
| Frontend, lockfile existant | 29 | 1 | 20 | 6 | 2 |
| Backend, résolution neuve des plages déclarées | 4 | 0 | 2 | 2 | 0 |

Frontend : notamment Axios 1.7.7, React Router DOM 6.26.2, Vite 5.4.8 ; le niveau critical concerne `form-data`, dépendance transitive. Backend : notamment Nodemailer/Mailtrap. Ce sont des alertes de paquets, **pas 33 chemins d'exploitation confirmés** dans cette application. Certaines concernent uniquement Node, le dev server, une option non utilisée ou des outils de build.

Le backend ignore ses lockfiles : impossible de reproduire exactement une ancienne installation. Le paquet npm `crypto` est déprécié et inutile puisque Node fournit ce module.

**Correction :** committer un lockfile backend, retirer crypto des dépendances et importer `node:crypto`, trier les avis selon leur atteignabilité puis mettre à jour par lots testables. Les mises à niveau majeures Mailtrap/Nodemailer nécessitent une vérification de leur intégration ; éviter une correction forcée globale.

## Bugs de fonctionnement

### BUG-01 — Login réussi mais sans user dans la réponse

**Références :** `backend/services/authService.js:131-135`, `backend/controllers/authController.js:23-28`, `frontend/src/context/AuthProvider.jsx:65-69`.

Le service renvoie les propriétés utilisateur à la racine, mais le contrôleur lit `response.user`. La réponse JSON omet donc user ; le frontend affecte undefined à sa session, puis la route privée le renvoie au login. Confirmé sur le vrai contrôleur avec un utilisateur simulé et une comparaison bcrypt réelle.

**Correction :** unifier le contrat `{user, refreshTokenExpiryDate}` et ajouter un test de connexion qui vérifie la réponse et l'accès au dashboard.

### BUG-02 — AuthProvider utilise une fonction non définie

**Références :** `frontend/src/context/AuthProvider.jsx:26-38`, `frontend/src/utils/routes.jsx:61`.

`getAllPublicPaths()` est appelée sans import. Lors d'une visite sans date de refresh en storage, le code lance une ReferenceError, avalée par catch. Le build laisse passer cette erreur, ESLint la détecte. Une simple comparaison de chaînes ne reconnaîtrait pas non plus `/reset-password/:token` comme un chemin concret.

**Correction :** centraliser les guards et le matching React Router, et vérifier la session auprès du serveur plutôt que de traiter localStorage comme condition obligatoire.

### BUG-03 — Inscription/confirmation sans session frontend cohérente

**Références :** `backend/services/authService.js:60,82-92`, `frontend/src/context/AuthProvider.jsx:89-93,104-110`, `frontend/src/api/auth.js:149-156`, `frontend/src/utils/PrivateRoute.jsx:13`.

L'inscription crée seulement un access cookie. La confirmation ne crée pas de refresh token ; le frontend ne renseigne jamais setUser après inscription ou confirmation. Il navigue vers un dashboard qui exige user, donc retourne au login. Un rechargement refuse également de consulter le serveur si la date de refresh manque.

**Correction :** définir explicitement un état « vérification requise », permettre le renvoi/rattrapage après expiration et établir la session complète après vérification, ou conduire clairement vers la connexion.

### BUG-04 — Renouvellement limité à check-auth

**Références :** `frontend/src/api/auth.js:159-182`, `frontend/src/api/axiosInstance.js:12-24`.

Le renouvellement existe uniquement lors du check initial. Après expiration pendant l'utilisation, update-profile ou request-email-change échoue en 401 sans renouvellement. Les durées des cookies sont aussi fixes alors que les durées JWT sont configurables (`backend/utils/generateTokenAndSetCookie.js:7,14,27,30-38`).

**Correction :** mécanisme partagé de renouvellement, une seule requête simultanée, une seule tentative de replay, exclusion des erreurs de credentials et de refresh ; durées dérivées d'une configuration unique.

### BUG-05 — Formulaires réactivés avant la fin des requêtes

**Références :** `frontend/src/pages/auth/Login.jsx:35-43`, `frontend/src/pages/auth/ForgetPassword.jsx:23-32`, `frontend/src/pages/auth/ResetPassword.jsx:27-35`, `frontend/src/pages/profile/EditProfile.jsx:21-30`, `frontend/src/pages/profile/EditEmail.jsx:21-28`.

Les fonctions async sont appelées sans await, puis submitting passe immédiatement à false. Le bouton permet plusieurs envois et les catch locaux ne suivent pas les promesses. Forgot-password efface même le formulaire avant de connaître le résultat.

**Correction :** attendre chaque opération, retourner un résultat exploitable depuis le provider et utiliser l'état de soumission de Formik.

### BUG-06 — Confirmation du changement d'email susceptible de répéter la requête

**Références :** `frontend/src/pages/profile/ConfirmationEmailChange.jsx:17-38`, `frontend/src/context/AuthProvider.jsx:186-192`, `frontend/src/utils/routes.jsx:97-102`.

L'effet dépend d'une fonction recréée à chaque rendu du provider. Le succès met à jour user, recrée cette fonction et peut relancer l'effet sur un token déjà consommé. La route exige aussi une connexion alors que l'API utilise le token public, ce qui empêche une confirmation directe dans un autre navigateur. Le contexte ne supprime pas pendingEmailChange après succès.

**Correction :** callback stable ou requête gérée directement avec contrôle d'exécution ; contrat clair pour une confirmation par lien ; remplacer l'utilisateur par le DTO serveur complet après succès. Le doublon exact reste à vérifier en navigateur.

### BUG-07 — Une erreur email peut masquer une opération déjà effectuée

**Références :** `backend/services/authService.js:58-62,82-87,176-182,345-353,380-390`.

L'opération est enregistrée avant l'envoi. Si l'email échoue, l'API répond en erreur alors que le compte existe déjà, le mot de passe a changé ou le token a été consommé. Réessayer n'a donc pas forcément le résultat attendu.

**Correction :** distinguer résultat métier et livraison, rendre le renvoi récupérable et utiliser une file/outbox avec retry pour les notifications.

### BUG-08 — Configuration et restauration incomplètes

**Références :** `frontend/vite.config.js:5-6`, `backend/app.js:12`, `backend/server.js:8-13`, `backend/services/authService.js:395-414`, `backend/utils/generateUniqueDeletedEmail.js:5-6`.

- Vite démarre sur 3000, CORS utilise 5173 par défaut : définir CLIENT_URL correctement.
- L'écoute HTTP commence sans attendre connectDB : petite fenêtre où les requêtes arrivent avant la disponibilité de MongoDB.
- restoreAccountService référence User sans import : ReferenceError confirmée. Il n'est actuellement exposé par aucune route. Même après import, l'email de suppression n'est pas une adresse valide pour le schéma ; le simple remplacement du suffixe ne constitue pas une stratégie complète de restauration.
- Pas de modèle `.env.example` backend ni de documentation de démarrage adaptée ; README frontend resté celui de Vite.
- Pas de route frontend 404. Le dashboard, les notifications et plusieurs champs du profil contiennent des données de démonstration ; ce ne sont pas des données métier connectées.

## Upgrade progressif proposé

### Étape 1 — Stabiliser et sécuriser l'auth existante

1. Corriger SEC-01/02/03 et BUG-01/02/03 en priorité.
2. Ajouter validation serveur, DTO utilisateur, erreurs cohérentes et règles de mot de passe alignées : le frontend accepte six caractères, le backend en exige huit (`Register.jsx:16`, `ResetPassword.jsx:14`, `User.js:18`).
3. Corriger await, états loading, renouvellement des sessions et confirmation par lien.
4. Ajouter `.env.example`, guide de démarrage, validation des variables au boot, health/readiness et attente de MongoDB.

### Étape 2 — Fiabiliser sessions, emails et maintenance

1. Introduire sessions révocables/rotation des refresh tokens et limitation des tentatives.
2. Mettre en place notifications récupérables et vrais tests de livraison sandbox.
3. Verrouiller les dépendances backend et corriger les alertes npm après analyse de leur usage. Actualiser les dépendances par petits lots, avec les migrations majeures séparées.
4. CI : lint, tests auth et build. Séparer les erreurs de configuration ESLint des erreurs applicatives ; supprimer les placeholders inutilisés.

### Étape 3 — Améliorer le produit sans tout réécrire

1. Pages paramètres : changement de mot de passe, suppression avec confirmation et gestion des sessions.
2. Finaliser les états vérification requise, renvoi du code, session expirée, erreur réseau et 404.
3. Remplacer les statistiques et notifications fictives par des données utiles ; améliorer navigation mobile, labels et accessibilité.
4. TypeScript et éventuellement 2FA/passkeys peuvent venir après stabilisation. Aucun changement de framework n'est nécessaire pour résoudre les défauts identifiés.

## Après disponibilité de MongoDB

Configurer localement `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` et Mailtrap. Les secrets restent dans `backend/.env`, déjà ignoré par Git. Le frontend utilise `VITE_APP_API_URL` ; aucune clé privée ne doit être placée dans une variable VITE.

Valider avec des comptes de test : inscription → email → confirmation → connexion → rechargement ; expiration/renouvellement ; reset et révocation ; changement d'email dans une nouvelle fenêtre ; suppression puis tentative avec anciens cookies ; entrées invalides et opérateurs rejetés ; email indisponible ; doublons et consommation concurrente d'un token. Terminer avec un parcours desktop/mobile réel.

## Références externes consultées

- [Express : sécurité de production et protection contre le brute force](https://expressjs.com/advanced/best-practice-security/).
- [Mongoose : options de requête et sanitizeFilter](https://mongoosejs.com/docs/api/query.html).
- Avis npm : [form-data, génération de boundary](https://github.com/advisories/GHSA-fjxv-7rqg-78g4), [Axios, URL absolues](https://github.com/advisories/GHSA-jr5f-v2jv-69x6), [Vite, accès au serveur de développement](https://github.com/advisories/GHSA-vg6x-rcgg-rjx6). L'applicabilité doit être vérifiée selon le chemin exécuté ; les chiffres ci-dessus viennent de npm audit, pas d'un test d'exploitation.
