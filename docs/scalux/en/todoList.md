# Complete Example: Todo‑List Application

A live example of the code below is available [here](https://stackblitz.com/edit/vitejs-vite-jxhu6bnj?file=src%2Fmain.tsx).

This example walks through building a fully‑featured Todo‑list app with **scalux**, showcasing:

- Fetching data from an (emulated) API
- State management (add, toggle, delete tasks)
- Storing todos in a dictionary (object)
- Using the `resolve`/`updates` pattern of `Updater` for complex mutations (add/delete)
- Implementing history (undo/redo) with `Undoable` and built‑in thunks
- Separating UI state from business data with `Slice`
- Accessing data with `Resolver` and the built‑in `selectors`

**Folder layout**

```
src/
├── api.ts            # Fake external API
├── types.ts          # Shared TypeScript types
├── TodoListComponent.tsx  # React presentational component (UI)
├── state.ts          # scalux state logic (Slices, Updaters, Component …)
├── store.ts          # Redux store configuration
├── main.tsx          # React entry point
└── index.css         # Styles (optional)
```

---

## 1. `src/types.ts` – Shared types

Clear types are essential with TypeScript, so we keep them in one place.

```typescript
// src/types.ts

/** Base type for a Todo item */
export type Todo = {
  id: string;
  label: string;
  done: boolean;
};

/** Dictionary form { id → Todo } */
export type TodoDict = Record<string, Todo>;

// ---- Props for the React component ----

/** Props that carry data to display */
export type TodoListComponentDataProps = {
  todos: Todo[]; // Todos as an array for rendering
  newItemText: string; // Text in the add‑item field
  isLoading: boolean; // API loading flag
  error: string | null; // API error message
  canUndo: boolean; // true if an undo is possible
  canRedo: boolean; // true if a redo is possible
};

/** Props that expose handlers the UI can call */
export type TodoListComponentHandlerProps = {
  fetchTodos: () => void;
  addTodo: (label: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setNewItemText: (text: string) => void;
  undoAction: () => void;
  redoAction: () => void;
};

/** Full prop set for the TodoListComponent */
export type TodoListComponentProps = TodoListComponentDataProps &
  TodoListComponentHandlerProps;
```

---

## 2. `src/api.ts` – Fake API

A lightweight simulation of a backend.

```typescript
// src/api.ts

// Shape returned by the API (may differ from our internal state)
export type ApiTodo = {
  id: string;
  title: string;
  completed: boolean;
};

/** Simulate an API request that fetches initial todos */
export const fetchTodosApi = async (): Promise<ApiTodo[]> => {
  console.log("API: Fetching todos …");
  await new Promise((r) => setTimeout(r, 800)); // Simulated latency

  if (Math.random() > 0.15) {
    // 85 % success – otherwise throw
    console.log("API: Fetch successful");
    const todos: ApiTodo[] = [
      { id: "1", title: "Learn scalux", completed: true },
      { id: "2", title: "Use Updater with resolve/reducers", completed: false },
      { id: "3", title: "Implement undo/redo", completed: false },
      { id: "4", title: "Drink a coffee", completed: true },
      { id: "5", title: "Test deletion", completed: false },
    ];
    return todos;
  }
  console.error("API: Fetch failed");
  throw new Error("Simulated network error while fetching todos.");
};

/** Simulate server‑side todo creation */
export const addTodoApi = async (label: string): Promise<{ id: string }> => {
  console.log(`API: Adding todo \"${label}\" …`);
  await new Promise((r) => setTimeout(r, 300));
  const newId = `temp_${Date.now()}`;
  console.log(`API: Todo added with temp ID ${newId}`);
  return { id: newId };
};
```

---

## 3. `src/TodoListComponent.tsx` – Presentational component

A vanilla React component responsible **only** for rendering and delegating interactions to the handlers passed in via props.

```tsx
// src/TodoListComponent.tsx
import React, { useEffect } from "react";
import type { TodoListComponentProps } from "./types";

/** Pure React component that displays the Todo list */
export const TodoListComponentDisplay: React.FC<TodoListComponentProps> = ({
  // Data props
  todos,
  newItemText,
  isLoading,
  error,
  canUndo,
  canRedo,
  // Handler props
  fetchTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  setNewItemText,
  undoAction,
  redoAction,
}) => {
  // Load todos on first mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  /** Handle form submission */
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      addTodo(newItemText.trim());
    }
  };

  return (
    <div style={{ padding: "0 2.5em" }}>
      <h1>My Scalux Todo List</h1>

      {/* Undo / Redo buttons */}
      <div>
        <button onClick={undoAction} disabled={!canUndo || isLoading}>
          Undo
        </button>
        <button onClick={redoAction} disabled={!canRedo || isLoading}>
          Redo
        </button>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ margin: "1em 0" }}>
        <input
          type="text"
          placeholder="New task …"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          disabled={isLoading}
          aria-label="New task"
        />
        <button type="submit" disabled={isLoading || !newItemText.trim()}>
          Add
        </button>
      </form>

      {/* Loading indicator */}
      {isLoading && <p>Loading todos …</p>}

      {/* Error */}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Todo list */}
      {!isLoading && !error && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                margin: "0.5em 0",
                textDecoration: todo.done ? "line-through" : "none",
                opacity: todo.done ? 0.6 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                style={{ marginRight: "0.5em" }}
              />
              <span style={{ flexGrow: 1 }}>{todo.label}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{ marginLeft: "0.5em" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {!isLoading && !error && todos.length === 0 && <p>No tasks yet!</p>}
    </div>
  );
};
```

---

## 4. `src/state.ts` – scalux state logic

Here we define the state shape, the update logic (Updaters), and connect the React component.

```typescript
// src/state.ts
import { State, Slice, Undoable } from "scalux";
import { fetchTodosApi, addTodoApi } from "./api";
import type { Todo, TodoDict, TodoListComponentDataProps } from "./types";
import { TodoListComponentDisplay } from "./TodoListComponent";

// ---- 1. State structure ----

// Business data slice (todos, input text) – wrapped in Undoable for history
const dataSlice = Slice(
  Undoable({
    todos: {} as TodoDict,
    newItemText: "",
  })
);

// UI slice (loading / error)
const uiSlice = Slice({
  loading: false,
  error: null as string | null,
});

// ---- 2. Initialize scalux ----
const { Component, register, Updater, Resolver, selectors, undo, redo } = State(
  {
    data: dataSlice,
    ui: uiSlice,
  }
);

// ---- 3. Updaters ----

/** Update the new‑item text field */
const setNewItemText = Updater((_s, txt: string) => ({
  data: { newItemText: txt },
}));

/** Toggle a todo */
const toggleTodo = Updater((state, id: string) => {
  const current = selectors.pick.data.todos(state)[id];
  if (!current) return {};
  return { data: { todos: { [id]: { ...current, done: !current.done } } } };
});

/** Fetch todos from the API */
const fetchTodos = Updater(async () => {
  try {
    const apiTodos = await fetchTodosApi();
    const dict = apiTodos.reduce((acc, t) => {
      acc[t.id] = { id: t.id, label: t.title, done: t.completed };
      return acc;
    }, {} as TodoDict);
    return { data: { todos: dict }, ui: { loading: false, error: null } };
  } catch (e: any) {
    return { ui: { loading: false, error: e.message || "Unknown error" } };
  }
});

/** Add a new todo (resolve / updates pattern) */
const addTodo = Updater({
  resolve: Resolver(async (_s, label: string) => {
    if (!label.trim()) throw new Error("Label cannot be empty");
    const { id } = await addTodoApi(label);
    return { id, label, done: false } as Todo;
  }),
  updates: {
    data: (draft, todo) => {
      draft.todos[todo.id] = todo;
      draft.newItemText = "";
    },
  },
});

/** Delete a todo */
const deleteTodo = Updater({
  resolve: Resolver((_s, id: string) => id),
  updates: {
    data: (draft, id) => {
      delete draft.todos[id];
    },
  },
});

// ---- 4. Connect the React component ----
const selectTodoListData = Resolver((state): TodoListComponentDataProps => {
  const todosDict = selectors.pick.data.todos(state);
  const newItemText = selectors.pick.data.newItemText(state);
  const isLoading = selectors.pick.ui.loading(state);
  const error = selectors.pick.ui.error(state);
  const raw = selectors.rawGrab.data(state);
  const canUndo = raw.past.length > 0;
  const canRedo = raw.future.length > 0;
  return {
    todos: Object.values(todosDict),
    newItemText,
    isLoading,
    error,
    canUndo,
    canRedo,
  };
});

export const ConnectedTodoList = Component({
  domain: "TodoList",
  render: TodoListComponentDisplay,
  data: selectTodoListData,
  handlers: {
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    setNewItemText,
    undoAction: undo,
    redoAction: redo,
  },
});

// ---- 5. Register reducers ----
const { reducer } = register();
export { reducer };
```

---

## 5. `src/store.ts` – Store configuration

```typescript
// src/store.ts
import { configureStore } from "scalux";
import { reducer } from "./state";

export const store = configureStore({ reducer });
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
```

---

## 6. `src/main.tsx` – Application entry point

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "scalux"; // React‑Redux provider
import { store } from "./store";
import { ConnectedTodoList } from "./state";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConnectedTodoList />
    </Provider>
  </React.StrictMode>
);
```

---

This code delivers a functional, well‑structured Todo‑list app that leverages all the key features of **scalux**: reduced boilerplate, async state handling, undo/redo, and the orchestra of `Slice`, `Updater`, `Resolver`, `Component`, and `selectors`. Feel free to experiment and extend!
