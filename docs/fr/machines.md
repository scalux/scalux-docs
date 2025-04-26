# Machines à état

## Problématique

Un composant peut devoir réagir aux événements différemment selon l'état de l'application.

Exemples courants :

- Jeux vidéo
- Canvas de dessin

Exemple simple : **bouton poussoir**

- Un événement : `press button`
- Deux états : `on` ou `off`
- Deux actions possibles selon l'état actuel :
  - Si état `on` → action : éteindre
  - Si état `off` → action : allumer

Cet automate très simple ne nécessite pas de méthodologie dédiée particulière :

```typescript
import { State } from "scalux";

const { Updater } = State({ status: "on" as "on" | "off" });

const handleSwitch = Updater(({ status }) => ({
  status: status === "on" ? "off" : "on",
}));
```

Considérons maintenant une situation plus complexe :

- Un jeu de plateau (échecs par exemple).
- Un composant `Board` traitant deux types d'événements : `clic` et `déplacement du curseur`.
- Déplacer une pièce nécessite plusieurs étapes :
  1. Cliquer sur une pièce pour la sélectionner
  2. Déplacer le curseur (la pièce suit alors le curseur)
  3. Cliquer sur une case cible pour déposer la pièce

La réaction à un événement dépend alors de plusieurs facteurs :

- État de sélection :
  - Si aucune pièce n'est sélectionnée → sélection de la pièce cliquée.
  - Si une pièce est sélectionnée → dépôt de cette pièce sur la nouvelle case.
- Tour du joueur :
  - Si c'est le tour du joueur actif → coup joué immédiatement.
  - Sinon → coup pré-enregistré, joué automatiquement dès que le tour arrive (sauf annulation).

Exemple de logique conditionnelle complexe :

```typescript
import { State } from "scalux";

const { Updater } = State({
  selectedPiece: null as null | string,
  turn: "white" as "black" | "white",
  player: "black" as "black" | "white",
  // autres propriétés du jeu
});

const boardClick = Updater(
  ({ selectedPiece, turn, player }, clickedPiece: string | null) => {
    if (player === turn) {
      if (selectedPiece) {
        // logique de dépôt
      } else {
        // logique de sélection
      }
    } else {
      if (selectedPiece) {
        // logique de pré-enregistrement de coup
      } else {
        // logique de pré-sélection ou autre action
      }
    }
  }
);
```

Même avec seulement trois propriétés (`selectedPiece`, `turn`, `player`), la lisibilité du code diminue rapidement.

Dans des cas encore plus élaborés, cette approche peut vite devenir ingérable.

## Modes

Les automates finis (ou machines à état) constituent une structure clé en informatique, soutenue par une solide base théorique.

Dans nos applications, nous utiliserons une approche simplifiée :

- Concevoir un automate consiste à nommer des états pour leur associer un traitement événementiel spécifique.
- Ces états nommés sont appelés **modes**, langage familier aux applications : mode de jeu, mode "dessin", mode "sélection".

Cette abstraction évite des imbrications de conditions et améliore la lisibilité et la maintenance.

## Instancier un automate : Machine

`scalux` permet d'exprimer les modes de manière expressive et composable à l'aide d'arbres.

### Machine

Prend en paramètre un arbre de modes. Par convention les feuilles valent `null`

### modesTree

En retour du constructeur `Machine`.
Ses feuilles sont les chemins jusqu'aux feuilles de l'arbre passés en paramètre de Machine, les clés étant
séparées par "/". Elles constituent l'ensemble des modes de la machine.

```typescript
// src/app/machines/index.ts
import { Machine } from "scalux";
import { TreePaths } from "scalux/helpers";

// sous modes
const playingModes = {
  piecePicking: null,
  pieceDumping: null,
};

// modes principaux
const modes = {
  userPlaying: playingModes,
  opponentPlaying: playingModes,
};

export const { modesTree } = Machine(modes);
export type Modes = TreePaths<typeof modes>;
```

```typescript
// src/app/state/index.ts
import { modesTree, Modes } from "../machines";
import { State } from "scalux";

const { Updater } = State({
  selectedPiece: null as null | string,
  turn: "white" as "black" | "white",
  player: "black" as "black" | "white",
  currentMode: modesTree.opponentPlaying.piecePicking as Modes, // "opponentPlaying/piecePicking"
  // autres propriétés du jeu
});

const boardClick = Updater(({ currentMode }, clickedPiece: string | null) => {
  if (currentMode === modesTree.userPlaying.piecePicking)
    return {
      // une pièce est sélectionnée, on passe donc dans le mode de dépôt
      mode: modesTree.userPlaying.pieceDumping,
      // ... autres modifications de la logique de sélection
    };
  else if (currentMode === modesTree.userPlaying.pieceDumping)
    return {
      // le coup est joué, tour à l'adversaire, on peut jouer un pré-coup
      mode: modesTree.opponentPlaying.piecePicking,
      // ... autres modifications de la logique de dépôt
    };
  else if (currentMode === modesTree.opponentPlaying.piecePicking)
    return {
      // une pièce est sélectionnée, on passe donc dans le mode de dépôt
      mode: modesTree.opponentPlaying.piecePicking,
      // ... autres modifications de la logique de pré-sélection
    };
  // correspond au mode opponentPlaying.pieceDumping
  else {
    return {
      // la pièce est déposéee, on repasse dans le mode sélection en attendant son tour
      modes: modesTree.opponentPlaying.piecePicking,
      // ... autre modifications de la logique de  pré-dépôt
    };
  }
});
```

La logique conditionnelle a été complètement applatie. Seule la variable d'état dédiée `mode`
est utilisée. Cette approche réduit considérablement la complexité du code et améliore sa lisibilité ainsi que sa maintenabilité.

## Macromodes et Submodes

**macroMode** : chemin partiel partant de la racine
**subMode**: chemin partiel arrivant à une feuille

Considérons les modes (simplifiés) d'une application architecturale :

```typescript
// src/app/machines/index.ts
import { Machine } from "scalux";
import { TreePaths } from "scalux/helpers";

const viewModes = {
  wall: {
    firstPoint: null,
    secondPoint: null,
  },
  navigate: null,
};

const modes = {
  root: {
    planeView: viewModes,
    view3D: viewModes,
  },
};

export const { modesTree, macroModes, subModes } = Machine(modes);
export type Modes = TreePaths<typeof modes>;
```

Lorsque les modes utilisent fortement la composition, on veut pouvoir effectuer deux types de transition :

- **Changer de macroMode sans changer le subMode** : Par exemple, passer de "root/planeView/wall/firstPoint" à
  "root/view3D/wall/firstPoint", en conservant le subMode "wall/firstPoint".

- **Changer de subMode sans changer le macroMode** : Par exemple, passer de "root/planeView/wall/firstPoint" à
  "root/planeView/wall/secondPoint", sans avoir à vérifier manuellement si le macroMode est "planeView" ou "view3D".

L'objet en retour de `Machine` contient pour cela deux proriétés : macroModes et subModes.

macroModes et subModes prennent respectivement en paramètre un macroMode et un subMode.

Ces fonctions renvoient deux propriétés :

- **match** : fonction qui prend en paramètre un mode et renvoie un booléen déterminant s'il contient le macroMode (respectivement subMode) passé à `macroModes` (respectivement `subModes`)

- **next** :
  fonction qui prend en paramètres :

  - le macroMode (respectivement subMode) remplaçant celui passé en paramètre de `macroModes` (respectivement `subModes`)
  - un mode

  renvoie le mode mis à jour

  Note :

  - le macroMode (subMode) de mise à jour est typé statiquement en fonction du macroMode (subMode) passé en paramètre
    de `macroModes` (`subModes`) : next ne peut pas renvoyer de mode invalide

### Exemple

Dans notre application de dessin :

- on veut pouvoir basculer entre vue en plan et vue 3D sans modifier le sous-mode de dessin
- dans un sous-mode :
  - **click** a pour effet :
    navigate → firstPoint, firstPoint → secondPoint, secondPoint → navigate
  - **escape** a pour effet :
    secondPoint → firstPoint, firstPoint → navigate, navigate → navigate

Cela se traduit par :

```typescript
// src/app/state/index.ts
import { modesTree, macroModes, subModes, Modes } from "../machines";

const { Updater } = State({
  currentMode: modesTree.planeView.navigate as Modes,
});

const toggleViewKind = Updater(({ currentMode }) => {
  const planeViewModes = macroModes("root/planeView");
  const view3DModes = macroModes("root/view3D");

  if (planeViewModes.match(currentModes))
    return { currentMode: planeViewModes.next("root/view3D", currentMode) };
  // forcément dans views3DModes
  else return { currentMode: view3DModes.next("root/planeView", currentMode) };
});

const navigate = subModes("navigate");
const firstPoint = subModes("wall/firstPoint");
const secondPoint = subModes("wall/secondPoint");

const handleClick = Updater(({ currentMode }) => {
  if (navigate.match(currentMode))
    return { currentMode: navigate.next("wall/firstPoint", currentMode) };
  if (firstPoint.match(currentMode))
    return { currentMode: firstPoint.next("wall/secondPoint", currentMode) };
  // forcément dans "wall/secondPoint"
  else return { currentMode: secondPoint.next("navigate", currentMode) };
});

const handleEscape = Updater(({ currentMode }) => {
  if (firstPoint.match(currentMode))
    return { currentMode: firstPoint.next("navigate", currentMode) };
  if (secondPoint.match(currentMode))
    return { currentMode: secondPoint.next("wall/firstPoint", currentMode) };
  // forcément dans "navigate" et on y reste, pas de modification nécessaire
  else return {};
});
```

## Mode options

Certains composants peuvent nécessiter des données extractibles des modes.

Par exemple, une prop `{ viewKind: "planeView" | "view3D" }` pour un composant `Controls` d'une application de dessin
afin d'autoriser/bloquer les rotations de la vue.

Construire cette propriété à l'aide de `subModes` est possible mais pas très expressif.

```typescript
const planeViewModes = macroModes("root/planeView");

const mkViewKind = (currentMode: Mode) => ({
  viewKind: planeViewModes.match(currentMode)
    ? { viewKind: "planeView" }
    : { viewKind: "view3D" },
});
```

Pour cela `Machine` renvoie également une propriété `mkModeOptions` prenant en paramètre une fonction qui reçoit l’arbre des modes et doit retourner un dictionnaire dont les valeurs sont des listes de noeuds internes de l'arbre.

Pour chaque clé du dictionnaire, mkModeOptions fournit un sélecteur acceptant un mode et renvoyant la clé du noeud enfant par lequel passe le mode (ou undefined sinon).

```typescript
// src/app/machines/index.ts

// Définition des modes comme précédemment
// ...

const machineModes = Machine(modes);

const { mkModeOptions } = machineModes;

export const modeOptions = mkModeOptions((modes) => ({
  viewKind: [modes.root],
  wallMode: [modes.root.planeView.wall, modes.root.view3D.wall],
}));

export const { modesTree, macroModes, subModes } = machineModes;
export type Modes = TreePaths<typeof modes>;
```

Ici, `modeOptions` a pour type :

```typescript
const modeOptions: {
  // Les fils de modes.root sont "planeView" et "view3D" – tous les modes les traversent
  viewKind: (mode: Modes) => "planeView" | "view3D";
  // Pour modes.root.planeView.wall et modes.root.view3D.wall,
  // les fils sont "firstPoint" et "secondPoint".
  // Certains modes (ex. modes.root.planeView.navigate) ne passent pas par ces noeuds,
  // d’où un retour de type "firstPoint" | "secondPoint" | undefined.
  wallMode: (mode: Modes) => "firstPoint" | "secondPoint" | undefined;
};
```

Le snippet précédent devient alors :

```typescript
const mkViewKind = (currentMode: Mode) => ({
  viewKind: modeOptions.viewKind(currentMode),
});
```

## Visualisation des transitions

L'utilisation de `mkLogger` présenté à la section _Modélistation avancée_ est utile pour le suivi des modes.

```typescript
import { mkLogger, RootState } from "state";

const logCurrentMode = mkLogger(
  (state: RootState) => state.currentMode,
  "currentMode"
);
```

Ce qui donnera dans l'état initial :

```
Init value for currentMode: "root/planeView/wall/firstPoint"
================================================
```

Puis à chaque changement de mode :

```
Prop currentMode changed
Previous value: "root/planeView/wall/firstPoint"
Next value: "root/planeView/wall/secondPoint"
================================================
```
