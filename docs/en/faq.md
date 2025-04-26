# Why `scalux` on Top of Redux Toolkit?

Redux Toolkit (RTK) is a major step forward for Redux developers, dramatically reducing boilerplate and baking in best practices by default. `scalux` actually builds on RTK and shares the same simplification philosophy. So, why consider `scalux`?

`scalux` is, of course, _batteries‑included_ with a set of built‑in features: history, finite‑state machines, the business API, labels and icons, helper components—all wrapped in a unified approach. Automatic generation of action types by the component with a semantic naming scheme is another _nice to have_.

Yet the motivation for creating `scalux` is **not** merely to be a feature bundle: a handful of plugins or utilities for vanilla RTK would have sufficed for that.

One of the driving forces behind `scalux` is to provide answers to certain architectural challenges that can remain even with RTK—especially when you need to handle **complex operations that touch multiple slices of state**, often coupled with **asynchronous logic** (such as API calls).

## The Challenge of Multi‑Slice Updates in RTK

In a Redux application structured with slices (created via `createSlice`), a business operation may need to update state residing in several distinct slices. When asynchronous logic is involved, the standard pattern in RTK usually looks like this:

1. Use `createAsyncThunk` to wrap the async call and dispatch actions that represent its life‑cycle (`pending`, `fulfilled`, `rejected`).
2. Implement `extraReducers` in _each_ affected slice so it can listen for those actions and apply slice‑specific state changes.

While this works, it can lead to the complete logic of a single business operation (API call **plus** updating slices A, B and C) being **scattered** across the thunk definition and multiple slice files. Understanding and maintaining the whole operation can require jumping back and forth between those files.

## The `scalux` Approach: Co‑Locating Complex Logic

`scalux` introduces patterns—like the `resolve` / `reducers` approach inside the `Updater` constructor (see the section _State Modifications: Updater_ or equivalent)—specifically designed to tackle this scenario:

1. The `resolve` function lets you handle asynchronous logic (e.g., an API fetch) and pre‑process whatever data the state update needs.
2. The `reducers` object allows you to define, **in the same place**, how every concerned part of the state (`InternalState`, often composed of slices) should change based on the result of `resolve`.

## Benefits of This Approach

By gathering asynchronous logic and multi‑slice state updates inside a **single conceptual unit** (`Updater`), `scalux` aims to:

- **Improve Readability:** The entire logic of a complex business operation is visible and understandable in one spot.
- **Simplify Maintenance:** Changes tied to a specific operation are localized, reducing the chance of omissions or inconsistencies.
- **Strengthen Consistency:** Business intent is expressed more clearly in the code.

---

In short, while Redux Toolkit provides an excellent foundation for simplifying Redux, `scalux` goes a step further by offering dedicated tools for better structuring and co‑locating complex business logic—addressing specific architectural challenges faced when building Redux applications at larger scale.
