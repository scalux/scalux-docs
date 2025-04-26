# Modeling: `State`, `Undoable`, `Slice`

Building your application starts with modeling its **initial state** via the `State` constructor exported by **scalux**:

```typescript
import { State } from "scalux";
```

## `State`

`State` takes a **serialisable object** (no primitives at the top level) and returns a set of strongly‑typed builders you’ll use to construct the rest of the app—with both the **safety of static typing** _and_ the **ergonomics of TypeScript inference**.

General pattern:

```typescript
import { State } from "scalux";

const appBuilders = State(initialState);
```

**Example**

```typescript
import { State } from "scalux";

type Task = { label: string; done: boolean };

const appBuilders = State({
  tasks: [] as Task[],
  filter: "all",
  newItemText: "",
});
```

The initial state is inferred; explicit annotations may be needed for complex types (unions, empty arrays, …).

```typescript
type InitState = { tasks: Task[]; filter: string; newItemText: string };
```

```typescript
import { State } from "scalux";

State(0); // ❌  Invalid: a primitive value is not allowed
// TypeScript: Argument of type 'number' is not assignable to parameter of type 'Obj'.
```

## `Undoable`

The `Undoable` modifier (exported by **scalux**) adds history management (undo/redo) through three properties:

- **present** – the current state
- **past** – a stack of previous states
- **future** – a stack of undone states

Whenever a change occurs, the old state is pushed onto `past` and replaced by the new state in `present`.

`Undoable` wraps the initial state passed to `State`:

```typescript
import { State, Undoable } from "scalux";

const appBuilders = State(Undoable({ count: 0 }));
```

## Global vs. Internal State

- **RootState** is the data structure obtained _after_ history is applied. It is the _complete_ state seen by components and the type returned by `store.getState()`.
- **InternalState** is the data wrapped _inside_ `Undoable`—the pristine state without history. Reducers operate on this structure.

For the counter example:

```typescript
type InternalState = { count: number };

type RootState = {
  present: { count: number };
  past: { count: number }[];
  future: { count: number }[];
};
```

_Note_: If there is **no** history, `InternalState` and `RootState` are identical.

## Splitting State with `Slice`

### Why slice the state?

As an app grows, splitting state into independent **slices** is a good practice for clearer **separation of concerns**—e.g. business data (chess piece positions) vs. UI data (dark/light theme, language).

It is sometimes a **requirement** with history: undoing a chess move should _not_ toggle the colour theme!

### How it works

`Slice` (also exported by **scalux**) accepts, like `State`, a _serialisable object with at least one property_.

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

### Slice **and** Undoable

Just like with `State`, the content of a `Slice` can be wrapped in `Undoable`; its data are then accessed through `sliceName.present`, `sliceName.past`, and `sliceName.future`.

```typescript
import { Slice, State, Undoable } from "scalux";

const uiSlice = Slice({ theme: "light", language: "fr" });
const counterSlice = Slice(Undoable({ count: 0 }));

const appBuilders = State({
  ui: uiSlice,
  counter: counterSlice,
});
```

Resulting state types:

```typescript
type InternalState = {
  ui: { theme: string; language: string };
  counter: { count: number };
};

type RootState = {
  ui: { theme: string; language: string };
  counter: {
    present: { count: number };
    past: { count: number }[];
    future: { count: number }[];
  };
};
```

### ⚠️ Homogeneous state

You **cannot** mix raw data and slices in the same `State`. Choose **one** approach:

```typescript
// Simple state
State({ count: 0 });
```

```typescript
// State with slices
State({ User: UserSlice, Counter: CounterSlice });
```

## Easy Data Access: Built‑in Selectors

### The problem with history

Adding/removing history changes property paths:

```typescript
// Without history
const count = state.Counter.count;

// With history
const count = state.Counter.present.count;
```

Maintaining code becomes painful. **scalux** offers several selectors that transparently account for historical slices.

Selectors are exposed on the object returned by `State`:

```typescript
const { Component, selectors, register } = State({
  User: UserSlice,
  Counter: CounterSlice,
});
```

Each selector below takes the global `RootState`.

#### `pick`

Directly selects a **property** of a slice, automatically drilling into `present` if the slice is undoable.

```typescript
selectors.pick.User.pseudo(state); // "John"
selectors.pick.Counter.count(state); // 0
```

#### `rawPick`

Returns the _raw_ historised version of **top‑level properties** when the slice is undoable.

```typescript
selectors.rawPick.User.pseudo(state); // "John"
selectors.rawPick.Counter.count(state); // { present: 0, past: [], future: [] }
```

#### `grab`

Gets the **whole slice**—simplified, whether historised or not.

```typescript
selectors.grab.User(state); // { pseudo: "John", age: 23 }
selectors.grab.Counter(state); // { count: 0 }
```

#### `rawGrab`

Gets the **raw** slice, including `past`, `present`, `future` if undoable.

```typescript
selectors.rawGrab.User(state);
// { pseudo: "John", age: 23 }

selectors.rawGrab.Counter(state);
// { present: { count: 0 }, past: [], future: [] }
```

#### `internalState`

Returns the simplified _global_ state (equivalent to `present` for each undoable slice).

```typescript
selectors.internalState(state);
/*
{
  User: { pseudo: "John", age: 23 },
  Counter: { count: 0 }
}
*/
```

#### `rootState`

Returns the full global state.

```typescript
selectors.rootState(state);
/*
{
  User: { pseudo: "John", age: 23 },
  Counter: { present: { count: 0 }, past: [], future: [] }
}
*/
```

_Tip_: use them to derive the `RootState` and `InternalState` types:

```typescript
type RootState = ReturnType<typeof selectors.rootState>;
type InternalState = ReturnType<typeof selectors.internalState>;
```

### Simple‑state case

With no slices the selectors are _prefixed directly_ with the property names:

```typescript
selectors.pick.count(state); // 0
```

## `initData`

Also returned by `State`, `initData` contains the **initial internal state**—handy for implementing `reset` features.

```typescript
const { initData } = State({ User: UserSlice, Counter: CounterSlice });

console.log(initData);
// { User: { pseudo: "John", age: 23 }, Counter: { count: 0 } }
```

---

## Tooling

For debugging, `State` exposes `mkLogger`.

`mkLogger`:

1. Takes
   - a selector of a global‑state property
   - a _display name_ for that property
2. Returns a Redux middleware that logs:
   - **initial value**
   - every **subsequent change**

```text
Init value for <displayName>: <value>
================================================

Prop <displayName> changed
Previous value: <prev>
Next value: <next>
================================================
```

scalux plays nicely with Redux Toolkit, so you can monitor state evolution easily.

`mkLogger` is particularly useful for tracking **state‑machine transitions** (see next section).
