# Présentation de scalux

**`scalux` simplifie radicalement la construction d'applications React-Redux robustes et évolutives.** En combinant intelligemment Redux Toolkit et TypeScript, `scalux` élimine le boilerplate traditionnel et vous permet de vous concentrer sur votre logique métier.

## Pourquoi choisir `scalux` ?

### ✅ Élimination du boilerplate

- Automatisation complète de la création d’actions, reducers et sélecteurs.
- Écriture concise du code : concentrez-vous sur votre logique métier.

### ✅ Centralisation claire de l’état

- Un état global unique : une seule source de vérité, clairement structurée.
- Gestion simplifiée des états complexes grâce aux slices, à l'historique (`Undoable`) et aux automates finis (`Machine`).

### ✅ Logique métier clarifiée et co-localisée

- Simplifie la gestion des opérations complexes, notamment asynchrones, même lorsqu'elles affectent plusieurs parties de l'état.
- Regroupe la logique associée à une fonctionnalité (ex: appel API + mises à jour multiples) en un seul endroit pour une meilleure lisibilité et maintenance.

### ✅ Approche "Batteries Incluses" complète

- Moins de dépendances à gérer : inclut des solutions prêtes à l'emploi pour l'historique (undo/redo), les machines à états, la gestion des libellés (`Labels`) et des icônes (`Icons`).

### ✅ Intégration transparente avec Redux Toolkit

- Compatibilité immédiate avec l'écosystème Redux existant : Redux DevTools, middlewares et plugins.
- Migration simple depuis des projets Redux traditionnels ou Redux Toolkit.

### ✅ Approche progressive adaptée à vos besoins

- Commencez simplement avec quelques concepts fondamentaux (`State`, `Component`, `Updaters`).
- Étendez progressivement votre application avec des fonctionnalités avancées (`Logic`, `Machine`).

### ✅ Liberté architecturale totale

- Organisez vos fichiers comme bon vous semble tout en bénéficiant de pratiques recommandées.

## Workflow de développement clair et efficace

L’architecture proposée par `scalux` suit une logique pyramidale, allant des fondations vers l'interface :

1. **Données** (`State`) : définissez clairement et simplement votre modèle de données initial.
2. **Logique métier** (`Logic`, `Updater`) : centralisez et gérez aisément toutes les modifications d’état.
3. **Composants** (`Component`, `Resolver`) : connectez vos composants React efficacement à votre état et à votre logique métier.

Cette séparation nette des responsabilités garantit une meilleure maintenabilité, des tests unitaires plus simples et une évolutivité fluide de votre application.

## Commencez dès maintenant

Découvrez comment `scalux` peut transformer votre façon de concevoir des applications React-Redux.

- [Démarrage rapide : construisez votre premier compteur en quelques lignes](./basics.md)
- [Gestion avancée de l'état : historique et slicing](./modelization.md)
- [Logique complexe simplifiée grâce aux machines à états](./machines.md)
- [Connectez simplement vos composants à vos données](./mapData.md)

Bienvenue dans une expérience de développement moderne, claire et efficace avec `scalux`. 🚀
