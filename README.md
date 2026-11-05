# Advanced MERN Auth

Application React/Express : inscription, confirmation email, sessions JWT révocables, récupération du mot de passe et paramètres du compte.

## Démarrage local

Node.js **22.12 ou supérieur** est requis. Deux terminaux :

```powershell
cd backend
npm ci
# Pour une nouvelle installation seulement : Copy-Item .env.example .env
# Renseigner les variables locales avant de démarrer.
npm run dev
```

```powershell
cd frontend
npm ci
npm run dev
```

Frontend : http://localhost:3000 — API : http://localhost:7500/api — disponibilité : `/api/health`.
Le serveur attend MongoDB avant d'écouter. `npm run dev` backend utilise le mode watch natif de Node.

## Configuration et secrets

- Les identifiants MongoDB et SMTP sont uniquement dans **backend/.env**, ignoré par Git. Les exemples versionnés ne contiennent aucun secret.
- Utiliser deux secrets JWT indépendants d'au moins 32 caractères. Exemple de génération : `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.
- `CLIENT_URL` doit correspondre à l'origine du frontend. Les cookies sont HttpOnly, SameSite strict et Secure en production ; garder frontend et API sur le même site.
- `ACCESS_TOKEN_SECONDS` et `REFRESH_TOKEN_SECONDS` déterminent à la fois la durée des JWT et celle des cookies.
- Le frontend ne reçoit que l'URL publique `VITE_APP_API_URL`. Ne jamais mettre un secret dans une variable `VITE_*`.
- La configuration locale fournie utilise **Mailtrap SMTP Sandbox**, port 2525. Les emails restent dans la boîte de test Mailtrap.
- Sur cette machine, le résolveur SRV de Node échoue alors que la résolution Windows fonctionne. Le `.env` local utilise donc la forme MongoDB standard avec les trois hôtes Atlas, TLS, replicaSet et authSource, obtenus depuis les enregistrements DNS du cluster. L'exemple générique accepte aussi une URI `mongodb+srv://`. Ne pas désactiver TLS pour contourner un problème de connexion.

## Parcours et sécurité

- Inscription : code cryptographique de six chiffres lié à une adresse, valable 10 minutes, maximum cinq erreurs. Le renvoi est disponible même après fermeture du navigateur. Aucun secret n'est inclus dans le DTO utilisateur.
- Vérification réussie : création de la session et ouverture du dashboard. Un compte non vérifié n'accède pas aux routes privées.
- Refresh : token haché stocké dans une collection `sessions`, rotation atomique et révocation en cas de réutilisation. Expiration absolue de sept jours par défaut. Le frontend regroupe les refresh simultanés.
- Logout révoque la session courante. Reset/changement du mot de passe, changement confirmé d'email et suppression invalident toutes les sessions du compte.
- Changement d'email et suppression : mot de passe actuel requis. Le lien de confirmation d'email fonctionne sans connexion ; une action explicite consomme le lien, puis l'utilisateur se reconnecte.
- Suppression : anonymisation et effacement explicite des secrets. L'ancienne fonction de restauration non fonctionnelle a été retirée ; aucune restauration automatique n'est promise.
- Validation stricte des entrées, limites de tentatives par IP et par adresse, contrôle d'origine et réponses d'erreur publiques contrôlées.
- `/auth/check-email` reste un endpoint public explicite de disponibilité, limité avec les autres routes auth. Comme l'inscription, il peut révéler qu'une adresse est déjà utilisée ; ne pas l'utiliser pour afficher une liste de comptes.

Les notifications sont persistées dans `emailjobs`. Le worker intégré les expédie, réessaie jusqu'à cinq fois et supprime le contenu après succès. Les jobs non envoyés expirent après un jour. Une panne SMTP ne transforme pas un changement de mot de passe réussi en erreur d'envoi. Les codes/liens présents dans les jobs en attente restent des données sensibles : accès à MongoDB limité au développement autorisé. Le worker peut livrer deux fois si un processus s'arrête après l'envoi SMTP et avant l'enregistrement du résultat.

## Vérifications

```powershell
cd backend
npm test
npm audit
```

```powershell
cd frontend
npm test
npm run lint
npm run build
npm audit
```

Les tests backend lancent un MongoDB temporaire isolé avec `mongodb-memory-server` et simulent SMTP. **Ils ne touchent pas la base Atlas ni la boîte Mailtrap.** Le premier lancement télécharge le binaire MongoDB et peut prendre plus longtemps. Les tests couvrent les injections, limites de vérification, sessions, reset concurrent, suppression et retry email. Les tests frontend couvrent l'état d'auth et la coordination du renouvellement.

Les deux lockfiles sont versionnables et les installations suivantes doivent utiliser `npm ci`. Les packages applicatifs ont été actualisés ; ESLint reste sur la dernière version 9 compatible avec `eslint-plugin-react`. Deux overrides Lodash corrigent les versions transitives épinglées par Formik. Tailwind 4 utilise des tokens locaux à la place du plugin TailGrids déprécié. React 19 gère directement les titres de page, sans react-helmet-async.

## Limites du mode développement

Les limites de débit utilisent la mémoire du processus. Pour plusieurs instances de production, choisir un stockage partagé et configurer précisément le proxy de confiance. Ce dépôt n'inclut ni déploiement, ni monitoring externe, ni 2FA. Des comptes existants antérieurs à cette migration devront se reconnecter ; leurs anciens liens de vérification/reset devront être renouvelés, car les nouveaux tokens sont hachés.

Le rapport initial est conservé dans `security_best_practices_report.md`. L'état des corrections et les résultats de validation sont dans `UPGRADE_NOTES.md`.
