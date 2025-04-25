# Introducing `scalux`

**`scalux` radically simplifies building robust and scalable React‑Redux applications.** By smartly combining Redux Toolkit with TypeScript, `scalux` wipes out traditional boilerplate and lets you focus on business logic.

## Why choose `scalux`?

### ✅ Boilerplate‑free development

- Full automation of action, reducer and selector creation.
- Concise code: spend your time on business logic, not wiring.

### ✅ Clear, centralized state

- A single global state—one well‑structured source of truth.
- Easier management of complex state via slices, history (`Undoable`) and finite‑state machines (`Machine`).

### ✅ Co‑located and clarified business logic

- Handles complex, especially asynchronous, operations that touch multiple parts of state.
- Gathers everything related to a feature (e.g., API call + multi‑slice updates) in one place for better readability and maintenance.

### ✅ A complete _batteries‑included_ approach

- Fewer dependencies to juggle: built‑in solutions for history (undo/redo), state machines, label handling (`Labels`) and icons (`Icons`).

### ✅ Seamless Redux Toolkit integration

- Instant compatibility with the existing Redux ecosystem: Redux DevTools, middleware, plugins.
- Smooth migration from classic Redux projects or pure Redux Toolkit setups.

### ✅ Progressive adoption that fits your needs

- Start light with a few core concepts (`State`, `Component`, `Updaters`).
- Gradually expand your app with advanced features (`Logic`, `Machine`).

### ✅ Total architectural freedom

- Organize files however you like while still enjoying recommended best practices.

## A clear, efficient development workflow

`scalux` promotes a pyramidal architecture that flows from foundations to UI:

1. **Data** (`State`): clearly and simply define your initial data model.
2. **Business logic** (`Logic`, `Updater`): centralize and manage all state mutations with ease.
3. **Components** (`Component`, `Resolver`): connect your React components efficiently to state and business logic.

This clean separation of responsibilities ensures easier maintenance, simpler unit testing and effortless scalability.

## Get started today

Discover how `scalux` can transform the way you build React‑Redux apps.

- [Quick start: build your first counter in a few lines](./basics.md)
- [Advanced state management: history and slicing](./modelization.md)
- [Simplify complex logic with state machines](./machines.md)
- [Easily wire your components to your data](./mapData.md)

Welcome to a modern, clear and efficient development experience with `scalux`. 🚀
