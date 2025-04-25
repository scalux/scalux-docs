# Connecting Data: `Resolver`

## Recap on `Component`

The `Component` constructor returned by `State` lets you connect a functional React component to its data **and** to the state‑mutation handlers in a _type‑safe_ way.

### Configuration

`Component` expects a configuration object with four properties:

- **domain** – A unique name inside the application. It prefixes the action types dispatched from the component: `componentDomain/action1`, `componentDomain/action2`, etc. An init‑time error catches duplicated `domain` values and tells you where they occur.

- **render** – The React component responsible for displaying the provided data.

- **data** – Determines how the component receives its **DataProps**.

- **handlers** – Hooks the component’s event system up to the application’s state‑mutation logic via its **HandlerProps**.

### `DataProps` and `HandlerProps`

- **HandlerProps** are the props whose type is either

  ```typescript
  () => void | ((payload: Payload) => void)
  ```

  Each of these props is associated (under the **handlers** key) with a handler that can:

  - interact with the state (often mutating it),
  - kick off API requests (web APIs, workers),
  - perform side‑effects (e.g. file‑system access).

- **DataProps** are simply all the remaining props—the ones not listed in `HandlerProps`.

**Example**

For a component of type:

```typescript
type TodoListComponentProps = {
  todos: { id: string; label: string; done: boolean }[];
  filter: "all" | "active" | "completed";
  addTodo: (label: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: "all" | "active" | "completed") => void;
};
```

Its **DataProps** (the data to display) are:

```typescript
type TodoListDataProps = {
  todos: { id: string; label: string; done: boolean }[];
  filter: "all" | "active" | "completed";
};
```

Its **HandlerProps** (user actions) are:

```typescript
type TodoListHandlerProps = {
  addTodo: (label: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: "all" | "active" | "completed") => void;
};
```

The rest of this section shows how to connect a component to its data via the **data** property—either with a **static object** or with a **dynamic selector**.

## Connecting with a Static Object

The **data** property can simply receive a plain object matching `DataProps`. This is handy during prototyping when the required state fields do not yet exist, or when the component only needs state access for its handlers but its displayed data are constant (e.g. a fixed‑size canvas that merely tracks pointer movement and clicks).

The resulting component is a plain `React.FC` ready to drop into JSX with **no extra props**.

**Example**

```typescript
type XY = { x: number; y: number };

type SensorProps = {
  width: number;
  height: number;
  onPointerMove: (pos: XY) => void;
  onPointerDown: (pos: XY) => void;
};

const AppSensor: React.FC = Component({
  // domain, render, handlers definitions …
  // data specified directly via a static object
  data: {
    width: 500,
    height: 300,
  },
});
```

```tsx
// Usage in JSX
<AppSensor />
```

### Handling OwnProps

**OwnProps** are the properties passed directly from a parent component via JSX. They become necessary when the data depend on information supplied by the parent (e.g. an item ID in a list or runtime display parameters).

If you pass a **partial static object** to **data**, any missing `DataProps` automatically become _required_ OwnProps.

**Example with OwnProps**

```typescript
type XY = { x: number; y: number };

type SensorProps = {
  width: number;
  height: number;
  onPointerMove: (pos: XY) => void;
  onPointerDown: (pos: XY) => void;
};

// data receives an empty static object
// width and height are missing → they become OwnProps
const AppSensor: React.FC<{ width: number; height: number }> = Component({
  // domain, render, handlers …
  data: {},
});
```

```tsx
// Usage in JSX
<AppSensor width={500} height={300} />
```

## Connecting with a Dynamic Selector

The **data** property can also receive a selector:

```typescript
(state: RootState, ownProps: OwnProps) => DataProps;
```

This is the approach used in most examples so far. Supplying an object as the second parameter defines the **OwnProps**.

### `Resolver`

Inline selectors are fine for trivial cases (no need to extract `{ data: (state) => ({ value: state.counter }) }`). For more advanced scenarios the `Resolver` constructor (also returned by `State`) comes into play.

`Resolver` takes a selector whose first parameter is `RootState` (typed through inference) and _optionally_ a second parameter (OwnProps). It simply returns that selector, but now strongly typed.

**Example with `Resolver` and OwnProps**

```tsx
import { State } from "scalux";

// Initial state
const { Component, Resolver, register } = State({
  counters: {
    counterA: 0,
    counterB: 10,
  },
});

type CounterName = "counterA" | "counterB";

type NamedCounterProps = {
  name: CounterName;
  value: number;
  increment: (name: string) => void;
  decrement: (name: string) => void;
};

// Pure rendering component
const NamedCounter = ({
  name,
  value,
  increment,
  decrement,
}: NamedCounterProps) => (
  <div>
    <h3>{name}</h3>
    <button onClick={() => decrement(name)}>-</button>
    <span>{value}</span>
    <button onClick={() => increment(name)}>+</button>
  </div>
);

// Define the resolver
const selectCounterByName = Resolver(
  (state, ownProps: { name: CounterName }) => ({
    value: state.counters[ownProps.name],
  })
);

// Connected component using Resolver
const NamedCounterComponent = Component({
  domain: "NamedCounter",
  render: NamedCounter,

  // Dynamic selection via Resolver
  data: selectCounterByName,

  handlers: {
    increment: ({ counters }, name: CounterName) => ({
      counters: { [name]: counters[name] + 1 },
    }),

    decrement: ({ counters }, name: CounterName) => ({
      counters: { [name]: counters[name] - 1 },
    }),
  },
});

// Final registration
const { reducer } = register();

export { NamedCounterComponent, reducer };
```

```tsx
// Usage in JSX
<NamedCounterComponent name="counterA" />
<NamedCounterComponent name="counterB" />
```

## Wrap‑up

In this chapter we covered **all the ways to hook a component up to its data**:

✅ With a **static object**

✅ With a **dynamic selector**

✅ Using **OwnProps** where needed
