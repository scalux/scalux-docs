# State Machines

## Problem Statement

A component may need to react to the **same event** in different ways depending on the current application state.

Typical examples:

- Video games
- Drawing canvases

A simple case: a **push button**

- One event: `press button`
- Two states: `on` or `off`
- Two possible actions depending on the current state:
  - If the state is `on` → action: turn **off**
  - If the state is `off` → action: turn **on**

Such a tiny automaton does **not** warrant any special methodology:

```typescript
import { State } from "scalux";

const { Updater } = State({ status: "on" as "on" | "off" });

const handleSwitch = Updater(({ status }) => ({
  status: status === "on" ? "off" : "on",
}));
```

Now consider something more involved:

- A board game (chess, for instance).
- A `Board` component dealing with two events: `click` and `cursor move`.
- Moving a piece requires several steps:
  1. Click a piece to **select** it
  2. Move the cursor (the piece follows the cursor)
  3. Click a target square to **drop** the piece

The reaction to an event now depends on multiple factors:

- **Selection state**
  - If no piece is selected → select the clicked piece.
  - If a piece is selected → drop that piece on the new square.
- **Player’s turn**
  - If it _is_ the active player’s turn → play the move immediately.
  - Otherwise → **pre‑record** the move, to be executed automatically when their turn comes (unless cancelled).

Example of rapidly growing conditional logic:

```typescript
import { State } from "scalux";

const { Updater } = State({
  selectedPiece: null as null | string,
  turn: "white" as "black" | "white",
  player: "black" as "black" | "white",
  // other game properties
});

const boardClick = Updater(
  ({ selectedPiece, turn, player }, clickedPiece: string | null) => {
    if (player === turn) {
      if (selectedPiece) {
        // drop logic
      } else {
        // select logic
      }
    } else {
      if (selectedPiece) {
        // pre‑record move logic
      } else {
        // pre‑select or other action
      }
    }
  }
);
```

Even with only three properties (`selectedPiece`, `turn`, `player`) readability drops quickly; in larger scenarios this pattern becomes unmanageable.

## Modes

Finite‑state machines are a cornerstone of computer science, backed by strong theory. In **scalux** we adopt a streamlined approach:

- Designing an automaton means naming states and assigning them dedicated event handling.
- These named states are called **modes**—a familiar term in apps (game mode, draw mode, selection mode…).

Using modes avoids deeply nested conditionals and boosts both clarity and maintainability.

## Instantiating an Automaton: `Machine`

`scalux` lets you declare modes expressively through **trees**.

### `Machine`

Accepts a _tree_ of modes. By convention **leaves** are `null`.

### `modesTree`

Returned by the `Machine` constructor.
Its leaves are strings composed of the path to each leaf in the input tree, with keys separated by `/`. These strings form the set of modes for the machine.

```typescript
// src/app/machines/index.ts
import { Machine } from "scalux";
import { TreePaths } from "scalux/helpers";

// sub‑modes
const playingModes = {
  piecePicking: null,
  pieceDumping: null,
};

// main modes
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
  // other game properties
});

const boardClick = Updater(({ currentMode }, clickedPiece: string | null) => {
  if (currentMode === modesTree.userPlaying.piecePicking)
    return {
      // a piece is selected → switch to dumping mode
      mode: modesTree.userPlaying.pieceDumping,
      // …other selection updates
    };
  else if (currentMode === modesTree.userPlaying.pieceDumping)
    return {
      // move played, opponent’s turn, maybe play a pre‑move
      mode: modesTree.opponentPlaying.piecePicking,
      // …other dropping updates
    };
  else if (currentMode === modesTree.opponentPlaying.piecePicking)
    return {
      // opponent selects a piece → stay in dumping sub‑mode
      mode: modesTree.opponentPlaying.pieceDumping,
      // …other pre‑selection updates
    };
  // currentMode is opponentPlaying.pieceDumping
  else {
    return {
      // piece dropped, go back to picking mode while waiting
      mode: modesTree.opponentPlaying.piecePicking,
      // …other pre‑drop updates
    };
  }
});
```

Conditional logic is now **flattened**—the dedicated `mode` state drives all branching, dramatically reducing complexity and improving readability.

## Macro‑modes and Sub‑modes

- **macroMode**: a _partial_ path starting at the root
- **subMode**: a _partial_ path ending at a leaf

Take the (simplified) modes of an **architectural design** app:

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

When modes rely heavily on composition you often want two kinds of transitions:

1. **Change the macroMode while preserving the subMode** – e.g. from `root/planeView/wall/firstPoint` to `root/view3D/wall/firstPoint`.
2. **Change the subMode while preserving the macroMode** – e.g. from `root/planeView/wall/firstPoint` to `root/planeView/wall/secondPoint`.

The object returned by `Machine` therefore exposes two helpers: `macroModes` and `subModes`.

Both functions receive a macroMode (respectively subMode) and return an object with:

- **match**: `(mode) => boolean` – does the given mode contain the macroMode/subMode?
- **next**: `(newMacroOrSub, mode) => mode` – returns an updated mode where the macro or sub part is replaced. Types guarantee that `next` cannot produce an invalid path.

### Example

In our drawing app:

- We want to toggle between _plan view_ and _3‑D view_ **without** altering the drawing sub‑mode.
- Inside a drawing sub‑mode:
  - **click** cycles `navigate → firstPoint`, `firstPoint → secondPoint`, `secondPoint → navigate`.
  - **escape** backs up: `secondPoint → firstPoint`, `firstPoint → navigate`, `navigate → navigate`.

```typescript
// src/app/state/index.ts
import { modesTree, macroModes, subModes, Modes } from "../machines";

const { Updater } = State({
  currentMode: modesTree.planeView.navigate as Modes,
});

const toggleViewKind = Updater(({ currentMode }) => {
  const planeView = macroModes("root/planeView");
  const view3D = macroModes("root/view3D");

  if (planeView.match(currentMode))
    return { currentMode: planeView.next("root/view3D", currentMode) };
  // otherwise we are in view3D
  return { currentMode: view3D.next("root/planeView", currentMode) };
});

const navigate = subModes("navigate");
const firstPoint = subModes("wall/firstPoint");
const secondPoint = subModes("wall/secondPoint");

const handleClick = Updater(({ currentMode }) => {
  if (navigate.match(currentMode))
    return { currentMode: navigate.next("wall/firstPoint", currentMode) };
  if (firstPoint.match(currentMode))
    return { currentMode: firstPoint.next("wall/secondPoint", currentMode) };
  // we must be in "wall/secondPoint"
  return { currentMode: secondPoint.next("navigate", currentMode) };
});

const handleEscape = Updater(({ currentMode }) => {
  if (firstPoint.match(currentMode))
    return { currentMode: firstPoint.next("navigate", currentMode) };
  if (secondPoint.match(currentMode))
    return { currentMode: secondPoint.next("wall/firstPoint", currentMode) };
  // already in "navigate" – no change needed
  return {};
});
```

## Mode Options

Some components may need data that can be **derived** from the current mode.

Example: a prop `{ viewKind: "planeView" | "view3D" }` for a `Controls` component in a drawing app, to enable/disable camera rotations.

You _could_ build that prop with `subModes`, but it is not very expressive:

```typescript
const planeView = macroModes("root/planeView");

const mkViewKind = (mode: Mode) => ({
  viewKind: planeView.match(mode) ? "planeView" : "view3D",
});
```

`Machine` also returns `mkModeOptions`. It accepts a function that receives the modes tree and returns a **dictionary** whose values are lists of **internal nodes**.

For each dictionary key, `mkModeOptions` provides a selector that takes a mode and returns the key of the child node traversed by that mode (or `undefined` if the mode is outside the listed nodes).

```typescript
// src/app/machines/index.ts

// modes defined as before …

const machine = Machine(modes);
const { mkModeOptions } = machine;

export const modeOptions = mkModeOptions((m) => ({
  viewKind: [m.root],
  wallMode: [m.root.planeView.wall, m.root.view3D.wall],
}));

export const { modesTree, macroModes, subModes } = machine;
export type Modes = TreePaths<typeof modes>;
```

Here `modeOptions` has the type:

```typescript
type ModeOptions = {
  viewKind: (mode: Modes) => "planeView" | "view3D";
  wallMode: (mode: Modes) => "firstPoint" | "secondPoint" | undefined;
};
```

Our previous snippet simplifies to:

```typescript
const mkViewKind = (mode: Mode) => ({
  viewKind: modeOptions.viewKind(mode),
});
```

## Visualizing Transitions

The `mkLogger` helper (see _Advanced Modeling_) is handy for tracking mode changes:

```typescript
import { mkLogger, RootState } from "state";

const logCurrentMode = mkLogger(
  (state: RootState) => state.currentMode,
  "currentMode"
);
```

Initial output:

```
Init value for currentMode: "root/planeView/wall/firstPoint"
================================================
```

Then on every mode change:

```
Prop currentMode changed
Previous value: "root/planeView/wall/firstPoint"
Next value: "root/planeView/wall/secondPoint"
================================================
```
