# State Modifications: `Updater` and `Thunk`

Component interactions with the application state are handled through the `Updater` and `Thunk` constructors returned by `State`.

`Updater` supports **two ways** of interacting with state:

1. **Return a partial update tree** – your go‑to for simple cases.
2. **Provide a dictionary of reducers** after optional pre‑processing of the incoming data.

`Thunk` takes a classic Redux thunk and gives it proper typing derived from your initial state.

## Connecting with a Partial Tree

`Updater` expects a function of type:

```typescript
(state: RootState, payload: Payload) => DeepPartial<InternalState>;
```

The first parameter is the global state, the second is an (optional) payload. The function returns a sub‑tree of `InternalState`; the leaves are the properties to update.

```typescript
import { State } from "scalux";

// Updater comes back from State, just like Component
const { Component, Updater, Resolver } = State({
  UserDetails: {
    name: "John Doe",
    hasDriverLicense: true,
  },
});

type UserDetailsComponentProps = {
  name: string;
  editName: (name: string) => void;
  toggleDriverLicense: () => void;
};

// Externalise component logic

// RootState (1st arg) isn’t used here
const editName = Updater((_, name: string) => ({ UserDetails: { name } }));

// RootState is inferred; no payload in this example
const toggleDriverLicense = Updater((state) => ({
  UserDetails: { hasDriverLicense: !state.UserDetails.hasDriverLicense },
}));
```

### Handling Asynchronous Requests

The update function can be **async** and use `await` as needed.

#### Example – Dice Roller with an API Call

```tsx
import { State } from "scalux";

const { Updater, Component, register } = State({ value: null });

type DieRollerProps = {
  value: number | null;
  roll: () => void;
};

const DieRoller = ({ value, roll }: DieRollerProps) => (
  <div>
    <div>
      {value !== null ? <span>{value}</span> : "Not played yet!"}
      <button aria-label="Roll the die" onClick={() => roll()}>
        Roll!
      </button>
    </div>
  </div>
);

const roll = Updater(async () => {
  const response = await fetch(
    "https://www.random.org/integers/?num=1&min=1&max=6&col=1&base=10&format=plain&rnd=new"
  );
  const text = await response.text();
  const value = parseInt(text.trim(), 10);
  return { value };
});

const AppDieRoller = Component({
  domain: "Die",
  render: DieRoller,
  data: (state) => ({ value: state.value }),
  handlers: {
    roll,
  },
});
```

## Connecting with a Thunk

A **thunk** is a curried function whose first parameter is a payload and whose result is a function receiving Redux’s `dispatch` and `getState`:

```typescript
const thunk: (
  payload: Payload
) => (dispatch: (action: AnyAction) => void, getState: () => RootState) => void;
```

The `Thunk` constructor simply wraps such a function and wires it to the state. This is handy when you need to dispatch **custom actions** that fall outside the standard naming scheme:

```json
{
  "payload": HandlerPayload,
  "type": "componentDomain/handlerName"
}
```

A common use‑case is **history management**.

### Undo/Redo History

The action creators from `redux-undo` – `undo`, `redo`, `jump`, `jumpToPast`, `jumpToFuture`, `clearHistory` – are re‑exported by **scalux** under the name `history`.

```typescript
import { history, State } from "scalux";

const { Thunk } = State({
  /* state definition */
});

const undo = Thunk(() => (dispatch) => dispatch(history.undo()));
const redo = Thunk(() => (dispatch) => dispatch(history.redo()));

const jump = Thunk(
  (steps: number) => (dispatch) => dispatch(history.jump(steps))
);
const jumpToPast = Thunk(
  (idx: number) => (dispatch) => dispatch(history.jumpToPast(idx))
);
const jumpToFuture = Thunk(
  (idx: number) => (dispatch) => dispatch(history.jumpToFuture(idx))
);
const clearHistory = Thunk(
  () => (dispatch) => dispatch(history.clearHistory())
);
```

In _most_ apps you only need `undo` and `redo`; these two thunks are exposed directly by `State`, so you can integrate undo/redo in a single line.

## Using Reducers

Returning an update tree is simple and expressive, but it has limits:

- It can get messy when you need to patch deep, distant branches.
- Newcomers might find the approach confusing.
- If part of the state is a dictionary (e.g. a todo map) an update tree lets you **add or modify** items—but **cannot delete** them.

### How it works

To handle such cases `Updater` also accepts a **configuration object** with two keys:

| Key         | Purpose                                                                                                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **resolve** | A function (possibly async) whose first parameter is `RootState` and second is the handler payload.<br/>It may itself be built with `Resolver`.                                                     |
| **updates** | How state actually changes.<br/>• **Simple state** – a single function `(state, payload) => void`.<br/>• **Sliced state** – a dictionary where each _impacted_ slice gets its own reducer function. |

Example signatures:

```typescript
// simple state
updates: (state: RootState, payload: ResolveReturn) => void

// sliced state
updates: {
  slice1: (state: RootState, payload: ResolveReturn) => void,
  slice3: (state: RootState, payload: ResolveReturn) => void,
}
```

The reducer functions mutate `state` with _dot notation_; immutability is guaranteed thanks to **Immer**.

## Wrap‑up

✅ **Asynchronous logic** in handlers via `async/await`.

✅ **Typed Redux thunks** for custom dispatch.

✅ **History integration** – full control with `history`, or one‑liners `undo`/`redo` for 90 % of cases.

✅ **Complex interactions** extracted from the UI into well‑structured `Updater`s (optionally with `Resolver`).
