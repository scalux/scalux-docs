# Architecture

`scalux` est une bibliothèque indépendante de votre architecture de fichier.

Aucun découpage de fichiers n’est imposé, mais il est recommandé d’adopter une approche claire et évolutive : **commencer petit, grandir naturellement, rester cohérent.**

## Principes

1. **Minimalisme initial** : commencez toujours par la solution la plus simple possible.
2. **Évolutivité naturelle** : ajoutez de la complexité uniquement lorsque le besoin se fait ressentir.
3. **Cohérence et modularité** : chaque fichier doit avoir une responsabilité clairement définie.

Par exemple pour un tout petit projet ou du prototypage rapide :

- **Un seul fichier d’état** : un fichier unique pour définir votre état initial, les composants connectés, et le store.
- **Pas de slices, pas de machines** : gardez-le minimal.

Fera l'affaire :

```ts
src/
├── app.tsx
└── main.tsx
```

## Architecture de référence

Lorsque votre application prend de l’ampleur, vous pouvez progressivement adopter une organisation plus modulaire. Voici une structure de référence souvent efficace :

```
src/
├── app/
│   ├── assets/               # Ressources statiques (icônes, wording, etc.)
│   │   ├── icons/
│   │   ├── wording/
│   │   └── index.ts
│   ├── components/           # Composants React connectés
│   │   ├── ExampleComponent1/
│   │   │   ├── data.ts
│   │   │   ├── handlers.ts
│   │   │   ├── render.ts
│   │   │   └── index.ts
│   │   ├── ExampleComponent2.ts
│   │   ├── ...
│   │   └── index.ts
│   ├── display/              # Composants UI de présentation
│   │   ├── buttons/
│   │   ├── inputs/
│   │   ├── selectors/
│   │   ├── texts/
│   │   └── index.ts
│   ├── logic/                # Logique métier réutilisable
│   │   ├── feature1/
│   │   ├── ...
│   │   └── index.ts
│   ├── machines/             # Logique d’automates / state machines
│   │   ├── ...
│   │   └── index.ts
│   ├── slices/               # Redux slices (état global modulaire)
│   │   ├── ...
│   │   └── index.ts
│   ├── state.ts              # Structure de l’état global
│   ├── store/                # Configuration du store Redux
│   │   ├── index.ts
│   │   └── middlewares.ts
│   └── main.tsx              # Point d’entrée de l’application
├── libs/                     # Fonctions et outils réutilisables
│   └── ...
└── ...                       # Autres fichiers ou configurations
```

### Notes sur cette architecture

- Composants connectés (app/components)
  Chaque dossier de composant regroupe data.ts, handlers.ts, et render.ts pour centraliser la logique métier (handlers, sélecteurs) et la partie affichage propre au composant. Vous pouvez tout rassembler dans un unique fichier si cela reste léger.
- Composants d’affichage (app/display)
  Ces composants sont purement « UI », sans logique métier. Ils peuvent être réutilisés partout et n’ont pas besoin d’être connectés à l’état global.
- Découpage de l’état (app/slices)
  Placez dans slices les fonctionnalités Redux-Toolkit plus avancées (Slices, Undoable, etc.).
- Automates (app/machines)
  Pour la logique d’état complexe (jeu, modales multi-étapes, workflows…), `scalux` propose une gestion structurée des machines à états. Conservez-les au même niveau que les slices, pour clairement distinguer la logique d’automate des données Redux standard.
- Ressources statiques (app/assets)
  Wording, icônes et autres fichiers statiques sont centralisés ici, prêts à être branchés avec les utilitaires `scalux` si besoin (gestion du multilingue, thèmes d’icônes…).
- state.ts et store/
  state.ts pour décrire la forme de l’état global (via State, Slices, etc.). Le dossier store/ accueille tout ce qui concerne la configuration du store Redux (middlewares, enhancers, etc.).
- Externalisation du métier dans logic pour les application de grande taille
- libs/
  Si vous avez des fonctions utilitaires qui ne relèvent pas directement d’une logique Redux ou d’un composant React, regroupez-les dans libs/. C’est l’espace idéal pour ce qui peut être potentiellement partagé avec d’autres projets.

  Cette architecture est conçue pour évoluer naturellement à mesure que votre application grandit, tout en restant facile à maintenir.
