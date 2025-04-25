# Pourquoi `scalux` par-dessus Redux Toolkit ?

Redux Toolkit (RTK) constitue une avancée majeure pour les développeurs Redux, réduisant considérablement le boilerplate et intégrant des bonnes pratiques par défaut. `scalux` s'appuie d'ailleurs sur RTK et en partage la philosophie de simplification. Alors, pourquoi envisager `scalux` ?

`scalux` offre bien sûr l'avantage d'être "batteries inclueded" avec un certain nombre de features built-in : l'historique, les automates finis, l'api métier, les libellés et les icones, les helper components, le tout dans une approche unifiée. La génération automatique des actions types par le composant avec une nomenclature sémantique est également un _nice to have_.
La raison du développement de `scalux` n'est cependant pas uniquement d'être une collection de features : des plugins ou utilitaires pour rtk vanilla auraient été suffisants.

L'une des motivations derrière `scalux` est de proposer des solutions à certains défis architecturaux qui peuvent persister même avec RTK, notamment lors de la gestion **d'opérations complexes affectant plusieurs "slices" de l'état**, souvent couplées à des **logiques asynchrones** (comme les appels API).

**Le Défi des Mises à Jour Multi-Slices dans RTK**

Dans une application Redux structurée avec des slices (créées via `createSlice`), une opération métier peut nécessiter de mettre à jour l'état dans plusieurs slices distinctes. Lorsqu'une logique asynchrone est impliquée, le pattern courant avec RTK implique souvent :

1.  L'utilisation de `createAsyncThunk` pour encapsuler l'appel asynchrone et dispatcher des actions représentant son cycle de vie (pending, fulfilled, rejected).
2.  L'implémentation de `extraReducers` dans _chaque_ slice concernée pour écouter ces actions et appliquer les modifications d'état spécifiques à cette slice.

Bien que fonctionnel, ce modèle peut conduire à ce que la logique complète d'une seule opération métier (appel API + mise à jour des slices A, B, et C) soit **distribuée** à travers la définition du thunk et les fichiers de plusieurs slices. Comprendre et maintenir l'ensemble de cette opération peut alors nécessiter de naviguer entre ces différents fichiers.

**L'Approche de `scalux` : Co-localisation de la Logique Complexe**

`scalux` propose des patterns, comme l'approche `resolve`/`reducers` au sein du constructeur `Updater` (voir section [Modifications de l'état : Updater] ou équivalent), spécifiquement conçus pour adresser ce scénario :

1.  La fonction `resolve` permet de gérer la logique asynchrone (ex: fetch API) et le pré-traitement des données nécessaires à la mise à jour.
2.  L'objet `reducers` permet de définir, **au même endroit**, comment chaque partie concernée de l'état (`InternalState`, souvent composé de slices) doit être modifiée en fonction du résultat de `resolve`.

**Avantages de cette Approche**

En regroupant la logique asynchrone et les mises à jour d'état multi-slices au sein d'une **unité conceptuelle unique** (`Updater`), `scalux` vise à :

- **Améliorer la Lisibilité :** Toute la logique d'une opération métier complexe est visible et compréhensible en un seul lieu.
- **Faciliter la Maintenance :** Les modifications liées à une opération spécifique sont localisées, réduisant le risque d'oublis ou d'incohérences.
- **Renforcer la Cohérence :** L'intention métier est plus clairement exprimée dans le code.

En conclusion, si Redux Toolkit fournit une excellente base pour simplifier Redux, `scalux` cherche à aller plus loin en offrant des outils dédiés pour mieux structurer et co-localiser la logique métier complexe, répondant ainsi à des défis architecturaux spécifiques rencontrés lors du développement d'applications Redux à plus grande échelle.
