---
layout: home
hero:
  name: "Scalux"
  text: "Build robust and scalable React‑Redux applications"
  actions:
    - theme: brand
      text: "Get Started"
      link: /scalux/en/intro
    - theme: outline
      text: "GitHub"
      link: https://github.com/scalux/scalux
features:
  - title: "🚀 Zero boilerplate"
    details: "Automates actions, reducers, and selectors so you can focus on what matters."
  - title: "🔄 Built-in history"
    details: "Undo/Redo ready out-of-the-box thanks to `Undoable`."
  - title: "🤖 State machines"
    details: "Model complex workflows in a clear and maintainable way."
  - title: "🌐 Multilingual & Themes"
    details: "Centralized labels and icons to easily manage languages and themes."
---

## Getting Started

Install with npm or yarn:

```bash
npm install scalux
```

## Quick Counter Example

Create a fully functional counter application in just a few lines:

```tsx
// src/app.tsx
import { State } from "scalux";

const { Component, register } = State({ count: 0 });

const CounterComponent = Component({
  domain: "Counter",
  render: ({ value, increment, decrement }) => (
    <div>
      <button onClick={increment}>+</button>
      <span>{value}</span>
      <button onClick={decrement}>-</button>
    </div>
  ),
  data: (state) => ({ value: state.count }),
  handlers: {
    increment: (state) => ({ count: state.count + 1 }),
    decrement: (state) => ({ count: state.count - 1 }),
  },
});

const { reducer } = register();
export { CounterComponent, reducer };
```

### Integrate with Redux Store

```tsx
// src/store.ts
import { configureStore } from "scalux";
import { reducer } from "./app";

export const store = configureStore({ reducer });
```

### Use in React Application

```tsx
// src/main.tsx
import ReactDOM from "react-dom/client";
import { Provider } from "scalux";
import { CounterComponent } from "./app";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <CounterComponent />
  </Provider>
);
```

## Advanced Features 🛠️

- **Undo/Redo History**: Easily enable state history management with `Undoable`.
- **Finite State Machines**: Clearly manage complex states using built-in finite automata.
- **Label and Icon Management**: Centralized multilingual support and theme-aware icons built-in.
- **Logic Abstraction**: Separate business logic clearly from components.

---

<p class="home-footer">
  <a href="https://www.npmjs.com/package/scalux" target="_blank">NPM</a>
  •
  <a href="https://github.com/scalux/scalux" target="_blank">GitHub</a>
  •
</p>
