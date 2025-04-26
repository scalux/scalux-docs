# Architecture

`scalux` is a library that is independent of your file architecture.

No file segmentation is enforced, but it is recommended to adopt a clear and scalable approach: **start small, grow naturally, stay consistent.**

## Principles

1. **Initial minimalism** : always start with the simplest possible solution.
2. **Natural scalability** : add complexity only when the need arises.
3. **Consistency and modularity** : each file must have a clearly defined responsibility.

For a very small project or rapid prototyping, for example:

- **A single state file** : one file to define your initial state, connect your components, and create the store.
- **No slices, no machines** : keep it minimal.

Will do the job:

```ts
src/
├── app.tsx
└── main.tsx
```

## Reference architecture

As your application grows, you can progressively adopt a more modular organisation. The following reference structure is often effective:

```
src/
├── app/
│   ├── assets/               # Static resources (icons, wording, etc.)
│   │   ├── icons/
│   │   ├── wording/
│   │   └── index.ts
│   ├── components/           # Connected React components
│   │   ├── ExampleComponent1/
│   │   │   ├── data.ts
│   │   │   ├── handlers.ts
│   │   │   ├── render.ts
│   │   │   └── index.ts
│   │   ├── ExampleComponent2.ts
│   │   ├── ...
│   │   └── index.ts
│   ├── display/              # Presentational UI components
│   │   ├── buttons/
│   │   ├── inputs/
│   │   ├── selectors/
│   │   ├── texts/
│   │   └── index.ts
│   ├── logic/                # Reusable business logic
│   │   ├── feature1/
│   │   ├── ...
│   │   └── index.ts
│   ├── machines/             # Automata / state-machine logic
│   │   ├── ...
│   │   └── index.ts
│   ├── slices/               # Redux slices (modular global state)
│   │   ├── ...
│   │   └── index.ts
│   ├── state.ts              # Shape of the global state
│   ├── store/                # Redux store configuration
│   │   ├── index.ts
│   │   └── middlewares.ts
│   └── main.tsx              # Application entry point
├── libs/                     # Reusable functions and utilities
│   └── ...
└── ...                       # Other files or configurations
```

### Notes on this architecture

- **Connected components (`app/components`)**  
  Each component folder groups `data.ts`, `handlers.ts`, and `render.ts` to centralise business logic (handlers, selectors) and the display code specific to the component. You can merge everything into a single file if it remains lightweight.

- **Presentational components (`app/display`)**  
  These components are purely “UI”, with no business logic. They can be reused anywhere and do not need to be connected to the global state.

- **State partitioning (`app/slices`)**  
  Put advanced Redux-Toolkit features (Slices, Undoable, etc.) here.

- **State machines (`app/machines`)**  
  For complex state logic (games, multi-step modals, workflows, …), `scalux` offers structured state-machine management. Keep them at the same level as the slices to clearly distinguish automaton logic from standard Redux data.

- **Static resources (`app/assets`)**  
  Wording, icons and other static files are centralised here, ready to be hooked up with `scalux` utilities if needed (multilingual handling, icon themes, …).

- **`state.ts` and `store/`**  
  `state.ts` describes the shape of the global state (via State, Slices, etc.). The `store/` folder contains everything related to configuring the Redux store (middlewares, enhancers, etc.).

- **Externalising business logic in `logic/` for large applications**

- **`libs/`**  
  If you have utility functions that do not directly relate to Redux logic or a React component, group them in `libs/`. This is the ideal place for code that could potentially be shared with other projects.

This architecture is designed to evolve naturally as your application grows, while remaining easy to maintain.
