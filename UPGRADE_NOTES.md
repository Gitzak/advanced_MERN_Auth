# Corrections et mise à niveau — 4 novembre 2026

Le rapport de revue initial est historique : ses références de lignes et ses alertes décrivent l'état avant correction.

## Corrections réalisées

- SEC-01/02 : DTO utilisateur par allowlist, validation Zod stricte, codes et tokens hachés, vérification liée à l'email et consommation atomique.
- SEC-03/04 : filtrage des comptes supprimés, `$unset` des secrets, sessions persistées avec rotation, contrôle de version et révocation serveur.
- SEC-05/06 : limites de tentatives, budget de cinq essais par code, mot de passe actuel pour email/suppression et contrôle d'origine.
- SEC-07 : réponses d'erreur contrôlées, récupération de mot de passe neutre et échappement HTML des noms. La disponibilité publique d'email reste une décision explicite documentée dans README.
- SEC-08 : packages actualisés, retrait des dépendances inutiles/dépréciées, lockfile backend conservé, overrides transitifs testés. `nodemon` est remplacé par `node --watch`.
- BUG-01 à BUG-06 : contrat login corrigé, initialisation par cookie serveur, état de vérification cohérent, refresh partagé, formulaires attendus et confirmation email sur action explicite.
- BUG-07 : file email persistante avec retry, séparée du résultat métier.
- BUG-08 : configuration documentée/validée, serveur démarré après MongoDB, retrait de la restauration cassée, 404 et données de compte réelles à la place des statistiques fictives.

## Vérification

- 12 tests backend avec un MongoDB isolé, sans toucher Atlas et sans envoyer de vrai mail.
- 9 tests frontend sur le provider, les guards et les refresh concurrents.
- Lint frontend et build de production réussis.
- Audit npm : aucun avis connu après les corrections de dépendances, backend et frontend (incluant outils de développement).
- Connexion réelle Atlas et authentification SMTP sandbox réussies.
- Parcours réel dans le navigateur : inscription, renvoi, vérification, accès privé et rechargement avec cookies ; captures desktop/mobile et contrôle d'overflow à 375px. Les réponses 401 du check initial sans connexion sont attendues.
- Des messages de vérification ont été acceptés par le serveur Mailtrap SMTP ; le worker les a marqués envoyés et a effacé leur contenu stocké. L'ouverture de la boîte via l'interface Mailtrap n'a pas été vérifiée.

Les captures de travail restent sous `output/playwright/`, ignoré par Git. Aucun commit ni push n'a été effectué.


## Documentation int?gr?e ? 5 novembre 2026

Ajout d?une page priv?e `/documentation/:slug?` et de son entr?e en bas de navigation. Dix guides Markdown d?crivent le code actuel : d?marrage, configuration, authentification, API, routes, architecture, email, tests et d?pannage. Recherche au clavier, sommaire, coloration syntaxique, copie et t?l?chargement `.md`, avec disposition adapt?e au mobile. Sept tests d?di?s v?rifient la navigation, la recherche, les ancres, le rendu, le t?l?chargement et la gestion du presse-papiers.
