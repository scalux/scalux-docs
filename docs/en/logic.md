# Logic, Components & API

The **scalux** API is built around **progressive enhancement**. For every major capability it provides two—sometimes three—levels of abstraction, so you can scale naturally as your application grows.

In the previous sections we looked at two ways of structuring a component’s logic:

- The _all‑in‑one_ method with `Component`, perfect for quick, simple cases.
- The _intermediate_ approach that introduces `Resolver`, `Updater`, and `Thunk`, which lifts business logic out of the component to improve readability and reuse in medium‑sized projects.

In this section we add a _third_ approach, `Logic`, aimed at ambitious and/or modular applications. It lets you centralize, type, and hierarchically organize all your business rules outside of React components.

## Goals

By the end of this section you will know how to:

- Fully externalize your business logic, independent of the UI.
- Re‑use that logic in many contexts (tests, services, workers, and more).
- Automatically generate a typed API that can interact with your application with **no** React dependency.

## Logic

The value returned by `State` also exposes a `Logic` constructor. It takes an _object tree_ where every leaf is a value produced by `Resolver` (or any state selector with at most one parameter) or by `Thunk`.

`Logic` is a _typing_ function: it does **not** mutate the tree but validates its shape, ensuring each leaf meets the expected contract (`Resolver` or `Updater`). In short, it helps you keep your business logic well‑organized and readable.

## Components

As your application grows, some **selectors** (`Resolver`) and **handlers** (`Updater`, `Thunk`) inevitably become shared by several components. It is best practice to move them out of individual component folders and into a dedicated `logic` directory.

Because `Logic` is purely a typing helper and never mutates its arguments, you can **freely compose logic trees**. That means you can structure selectors and handlers in a **hierarchical** and **modular** way, bundle them into a single **central** object (`logic`), and enjoy easier maintenance.

### Version 2 of “Higher or Lower”

```typescript
// src/state.ts

import { State, Undoable } from "scalux";

//  Initial state with history support (undo/redo)
export const { Component, Updater, Resolver, undo, redo, register } = State(
  Undoable({
    targetValue: null as number | null,
    userValue: 50,
  })
);
```

```typescript
// src/logic.ts
import { Updater, Resolver, undo, redo, Logic } from "./state";

// Explicit external handlers
const increment = Updater(({ userValue }) => ({ userValue: userValue + 1 }));
const decrement = Updater(({ userValue }) => ({ userValue: userValue - 1 }));
const setTargetValue = Updater((_, targetValue: number) => ({ targetValue }));

const fetchTargetValue = Updater(async () => {
  const response = await fetch(
    "https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new"
  );
  const text = await response.text();
  return { targetValue: parseInt(text.trim(), 10) };
});

const guessComponentData = Resolver((state) => ({
  userValue: state.present.userValue,
  targetValue: state.present.targetValue,
}));

// Logic tree
const logic = Logic({
  targetValue: {
    setTargetValue,
    fetchTargetValue,
  },
  userValue: { increment, decrement },
  history: { undo, redo },
  components: {
    guessComponentData,
  },
});

export { logic };
```

```tsx
// src/GuessComponent.tsx
import { logic } from "./logic";
import { Component } from "./state";

interface GuessComponentProps {
  userValue: number;
  targetValue: number | null;
  increment: () => void;
  decrement: () => void;
  fetchTargetValue: () => void;
  undo: () => void;
  redo: () => void;
}

// Pure React rendering component
const GuessComponent = ({
  userValue,
  increment,
  decrement,
  fetchTargetValue,
  undo,
  redo,
  targetValue,
}: GuessComponentProps) => {
  useEffect(() => {
    if (targetValue === null) fetchTargetValue();
  }, [targetValue]);

  const hint =
    targetValue === null
      ? "Loading…"
      : userValue < targetValue
      ? "Higher"
      : userValue > targetValue
      ? "Lower"
      : "Congrats, you found it! 🎉";

  return (
    <div>
      <h3>Value: {userValue}</h3>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
      <p>{hint}</p>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
};

// Final assembly with data and handlers
const GuessNumberApp = Component({
  domain: "GuessNumber",
  render: GuessComponent,
  data: logic.components.guessComponentData,
  handlers: {
    increment: logic.userValue.increment,
    decrement: logic.userValue.decrement,
    undo: logic.history.undo,
    redo: logic.history.redo,
    fetchTargetValue: logic.targetValue.fetchTargetValue,
  },
});

const { reducer, mkApi } = register(logic);

export { GuessNumberApp, reducer, mkApi };
```

```typescript
// src/store.ts
import { configureStore } from "scalux";
import { reducer, mkApi } from "./GuessComponent";

export const store = configureStore({
  reducer,
});

const api = mkApi(store);
```

## API

The `register` function returned by `State` optionally accepts the `logic` object.

It returns an object with:

- `reducer`: the Redux reducer you plug into your store.
- `mkApi(store)`: a function that—once called with a store—yields a **typed API** derived from your logic tree.

### Structure of the generated API

```typescript
const api = mkApi(store);
```

The `api` object contains:

- `app`: a mirror of the `logic` tree

  - Every _Value_ becomes a getter (or a one‑parameter function for payload)
  - Every _Handler_ becomes a function that dispatches an action typed with the convention `api/path/to/handler`
  - Every _Thunk_ also becomes a function
  - Methods and selectors are `async` whenever the underlying resolver or updater is asynchronous.

- `state`: a set of auto‑generated selectors exposed as getters, giving direct access to the primitive properties of your state.

### Example

```typescript
// index.ts
import { api } from "./store";

// Dispatch an increment action
api.app.userValue.increment();

// Read the current userValue via the getter
console.log("userValue after increment:", api.state.pick.userValue);

// Fetch targetValue asynchronously
api.app.targetValue.fetchTargetValue().then(() => {
  console.log("Fetched targetValue:", api.state.pick.targetValue);
});
```

### Use‑cases

The scalux API shines whenever centralized and standardized access to state and handlers is valuable. Typical scenarios include:

**✅ Unit tests without mocking React or Redux**

```typescript
test("increment reaches the target", () => {
  api.app.targetValue.setTargetValue(53);
  api.app.userValue.increment();
  api.app.userValue.increment();
  api.app.userValue.increment();

  expect(api.state.pick.userValue).toBe(api.state.pick.targetValue); // true
});
```

**✅ Business services / workflow modules**

In complex apps you may need to query state or dispatch actions from non‑UI modules (utilities, services, …). With `api.app.*` and `api.state.*` you can do that without React or Redux.

**✅ Integration with external effects (WebSocket, Web Workers)**

```typescript
socket.on("updateScore", (score) => {
  api.app.targetValue.setTargetValue(score);
});
```

**✅ Debugging, temporary scripts, visualization**

```typescript
console.log("Current state:", api.state.getState);
api.app.userValue.increment();
```
