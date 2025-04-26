# Modélisation : `State`, `Undoable`, `Slice`

La construction de votre application commence par la modélisation de son état initial via le constructeur `State` exporté par `scalux`.

```typescript
import { State } from "scalux";
```

## State

`State` accepte en paramètre un objet sérialisable (pas de primitive) et retourne un ensemble de constructeurs fortement typés par l'état initial vous permettant de bâtir le reste de votre application avec la **sécurité d'un typage fort** et le **confort de l'inférence de type** poussée de Typescript.

Le pattern général est :

```typescript
import { State } from "scalux";

const appBuilders = State(initialState);
```

**Exemple**

```typescript
import { State } from "scalux";

type Task = { label: string; done: boolean };

const appBuilders = State({
  tasks: [] as Task[],
  filter: "all",
  newItemText: "",
});
```

L'état initial est typé par inférence, des annotations de type peuvent être nécessaires pour préciser les types complexes (comme les unions) ou les initialisations de listes vides comme dans l'exemple ci-dessus.

L'état est inféré comme :

```typescript
const initState: { tasks: Task[]; filter: string; newItemText: string };
```

```typescript
import { State } from "scalux";

const appBuilder = State(0); // ❌  Invalid : une valeur ne doit pas être une primitive
// typescript:  Argument of type 'number' is not assignable to parameter of type 'Obj'
```

## Undoable

Le modificateur `Undoable` exporté depuis "scalux" permet de gérer l'historisation (fonctionalités undo/redo) via trois propriétés :

- present : état actuel

- past : liste des états précédents

- future : liste états annulés (undo)

Lorsqu'un changement survient, l'ancien état est déplacé vers `past` et remplacé par le nouvel état dans `present`.

`Undoable` enveloppe l'état initial passé à `State`.

```typescript
import { State, Undoable } from "scalux";

const appBuilders = State(Undoable({ count: 0 }));
```

## Etat global (RootState) vs Etat Interne (InternalState)

Le **RootState** est la structure de données obtenue en appliquant les modifications apportées par l'historisation sur la structure de données initiale : c'est l'état complet, tel que vu par les composants de l'application. C'est également le type de la valeur obtenue en retour de `store.getState` de Redux.

**InternalState** est la structure de données enveloppée par `Undoable`, c'est l'état initial sans historisation. **InternalState** est la structure de données passée aux réducteurs de l'application.

Dans l'exemple du compteur :

```typescript
type InternalState = { count: number };

type RootState = {
  present: { count: number };
  past: { count: number }[];
  future: { count: number }[];
};
```

_Remarque_: en l'absence d'historique `InternalState` et `RootState` sont confondus.

## Découper l'état avec `Slice`

### Pourquoi découper l'état ?

Lorsque votre application grandit, découper son état en sous-ensembes indépendants appelés **slices** est **une bonne pratique pour assurer une meilleure séparation des préoccupations** : par exemple grouper logiquement les données métier (positions des pièces d'un jeu) indépendamment des données UI (thème clair/sombre, langue).

C'est parfois aussi une **nécessité dans le cadre le l'historisation** : on ne souhaite pas que l'annulation ou la répétition d'un coup dans la revue d'une partie d'échecs entraine automatiquement un basculement entre les thèmes sombres et clairs !

### Fonctionnement

Le constructeur `Slice` est également exporté par "scalux" et accepte comme `State` **un objet sérialisable avec au moins une propriété**.

```typescript
import { State, Slice } from "scalux";

type Task = { label: string; assignee: string; done: boolean };
type Person = { id: string; name: string; grade: number };

const todosSlice = Slice({
  tasks: [] as Task[],
  filter: "all",
  newItemText: "",
});

const peopleSlice = Slice({
  people: [] as Person[],
});

const appBuilders = State({
  todos: todosSlice,
  people: peopleSlice,
});
```

### Slice et Undoable

De manière analogue à `State` le contenu de l'état d'une `Slice` peut être enveloppé par le modificateur `Undoable` : son contenu sera alors accessible à travers les propriétés `sliceName.present`, `sliceName.past` et `sliceName.future`.

**Exemple**

```typescript
import { Slice, State, Undoable } from "scalux";

const uiSlice = Slice({ theme: "light", language: "fr" });

const counterSlice = Slice(Undoable({ count: 0 }));

const appBuilders = State({
  ui: uiSlice,
  counter: counterSlice,
});
```

Les états internes (`InternalState`) et globaux (`RootState`) de l'application seront respectivement :

```typescript
type InternalState = {
  ui: { theme: "string"; language: string };
  counter: { count: number };
};

type RootState = {
  ui: { theme: "string"; language: string };
  counter: {
    present: { count: number };
    past: { count: number }[];
    future: { count: number }[];
  };
};
```

### ⚠️ Etat homogène

Vous ne pouvez pas mélanger des **slices** et des données brutes directement dans `State`. Vous devez choisir l'une de ces deux approches

- État simple :

```typescript
const appBuilders = State({
  count: 0,
});
```

- État avec slices :

```typescript
const appBuilders = State({
  User: UserSlice,
  Counter: CounterSlice,
});
```

## Accéder simplement aux données : Sélecteurs intégrés

### Problème posé par l'historisation

L'ajout/suppression d'un historique modifie le chemin d'accès aux proprités des slices

```typescript
// sans historique
const count = state.Counter.count;
```

```typescript
// avec historique
const count = state.Counter.present.count;
```

Cela dégrade fortement la maintenabilité de l'app car il faut alors modifier tous les sélecteurs
y faisant référence.

`scalux` propose plusieurs sélecteurs dérivés de l'état pour simplifier l'accès aux slices et à leur propriétés de manière transparante, en tenant compte du fait que certaines propriétés sont historisées.

Les `selectors` sont une propriété en retour de la fonction `State`.

```typescript
const { Component, selectors, register } = State({
  User: UserSlice,
  Counter: CounterSlice,
});
```

Toutes sélecteurs décrits ci-dessous prennent en paramètre l'état global RootState.

### pick

Sélectionne directement une propriété d'une slice, en tenant compte automatiquement de l'état actuel (`present`) si la slice est historisée.

```typescript
selectors.pick.User.pseudo(state); // "John"
selectors.pick.Counter.count(state); // 0
```

### rawPick

Renvoie la version historisée **des propriétés de premier niveau** pour les slices historisables

```typescript
selectors.rawPick.User.pseudo(state); // "John"
selectors.rawPick.Counter.count(state);
// => { present: 0, past: [], future: [] }
```

### grab

Permet d'obtenir l'ensemble des données d'une slice, simplifié (historisé ou non).

```typescript
selectors.grab.User(state);
// => { pseudo: "John", age: 23 }

selectors.grab.Counter(state);
// => { count: 0 }
```

### rawGrab

Permet d'obtenir l'état complet, brut, incluant les données historiques (`past`, `present`, `future`) si la slice est historisée.

```typescript
selectors.rawGrab.User(state);
// => { pseudo: "John", age: 23 }

selectors.rawGrab.Counter(state);
// => { present: { count: 0 }, past: [], future: [] }
```

### internalState

Renvoie directement l'état global simplifié (équivalent du `present` pour chaque slice historisée).

```typescript
selectors.internalState(state);
/*
{
  User: { pseudo: "John", age: 23 },
  Counter: { count: 0 }
}
*/
```

### rootState

Renvoie directement l'état global

```typescript
selectors.rootState(state);
/*
{
  User: { pseudo: "John", age: 23 },
  Counter: { present: { count: 0 }, past: [], future: [] }
}
*/
```

**Note :** Le cas d'usage des sélecteurs `internalState` et `rootState` est surtout d'obtenir les types `InternalState` et `RootState` avec :

```typescript
type RootState = ReturnType<typeof selectors.rootState>;
type InternalState = ReturnType<typeof selectors.internalState>;
```

### Cas d'un état simple

Dans le cas d'un état simple (sans `Slice`), les sélecteurs (pick, grab, etc.) préfixent directement les propriétés qu'ils pointent :

**Exemple**

```typescript
selectors.pick.count(state); // 0
```

## initData

Egalement dans l'objet retourné par `State`, contient l'état interne initial (analogue à getState pour l'état initial).
S'utilise dans les fonctionnalités `reset` (par exemple resetCount dans un compteur).

```typescript
const { Component, selectors, initData register, mkLogger } = State({
  User: UserSlice,
  Counter: CounterSlice,
})

console.log(initData);
// { User: { pseudo: "John", age: 23 }, Counter: { count: 0 } }
```

## Tooling

A des fins de debugging, `State` renvoie également une propriété `mkLogger`.

`mkLogger`:

- prend en paramètres :
  - un sélecteur de propriété de l'état global
  - un displayName (string) pour la propriété à suivre
- renvoie un middleware `redux`

Ce middleware log dans la console :

- dans l'état initial:

  ```
  Init value for `${displayName}`: `${propValue}`
  ==================================================
  ```

- puis à chaque changement de valeur de la propriété :

  ```
    Prop `${displayName}` changed
    Previous value: `${prevValue}`
    Next value: `${nextValue}`
    ================================================
  ```

`scalux` est pleinement compatible avec redux-toolkit permettant le suivi des évolutions de l'état.

Ce middleware est pratique pour observer une propriété évoluant occasionnellement,
sans devoir parcourir l'arbre d'état à chaque action pour observer ses éventuels changements.
Il est particulièrement adapté au suivi des transitions d'une machine à états (section suivante).
