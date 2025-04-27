# Assets: `Labels` and `Icons`

This section introduces two utilities provided by **`scalux`** that make it easy to centrally manage multilingual text content (labels) and icons adapted to different themes. These tools integrate seamlessly with your state logic and guarantee a consistent user experience.

## Labels

The `Labels` utility lets you define and use labels according to the language currently active in the application, either through connected React components, reactive hooks, or direct string access.

With **`Labels`**, you can:

- Centralise textual labels.
- Easily handle several languages.
- Guarantee a consistent interface when a language is undefined (by falling back to the default language).
- Seamlessly integrate labels into React components (`connectLabels`, `useLabel`).
- Retrieve label strings directly when needed (`getLabel`).

### Syntax and configuration

```tsx
import { State } from "scalux";
import { LabelComponentProps } from "scalux/helpers";
import React from "react";

const { Labels } = State({ language: "fr" });

// Labels configuration
const { connectLabels, mkUseLabel, getLabel } = Labels({
  options: ["fr", "en"], // Supported languages
  fallBack: "en", // Default language
  items: {
    Tool: {
      fr: "Outil",
      en: "Tool",
    },
    Edit: "Edit",
    Design: "Design",
    SearchPlaceholder: {
      fr: "Rechercher...",
      en: "Search...",
    },
  },
});

// --- Example with connectLabels ---
const Title = ({ text }: LabelComponentProps) => <h1>{text}</h1>;

const AppTitle = connectLabels({
  language: (state) => state.language, // Language selector
  render: Title,
});

const Titles = () => (
  <div>
    <AppTitle item="Tool" /> {/* <h1>Outil</h1> (if language="fr") */}
    <AppTitle item="Edit" /> {/* <h1>Edit</h1> */}
  </div>
);

// --- Example with useLabel ---
const useLabel = mkUseLabel((state) => state.language); // Create the hook with the selector

const MyInputComponent = () => {
  const placeholder = useLabel("SearchPlaceholder"); // Hook to get reactive text
  const tooltip = useLabel("Tool");

  return (
    <input
      type="text"
      placeholder={placeholder} // Use as a prop
      title={tooltip} // Use as a prop
    />
  );
  // If state.language changes from "fr" to "en",
  // placeholder will become "Search..." and tooltip will become "Tool" automatically.
};

// --- Example with getLabel ---
const logLabels = () => {
  const toolLabelDefault = getLabel("Tool"); // Uses fallback language ("en") -> "Tool"
  const toolLabelFrench = getLabel("Tool", "fr"); // Forces French -> "Outil"
  const editLabel = getLabel("Edit"); // Static label -> "Edit"

  console.log(toolLabelDefault, toolLabelFrench, editLabel);
};
```

### Code walkthrough

The `Labels` function (returned by `State`) receives a configuration object containing:

- **options** – the tuple of supported languages.
- **fallback** – the default language (must be one of `options`).
- **items** – an object where each key maps to either:
  - a static string (used for all languages), or
  - an object that assigns a specific label for each language.

`Labels` returns an object containing `connectLabels`, `mkUseLabel`, and `getLabel`:

1.  **`connectLabels`**: A Higher-Order Component (HOC) connector that expects:

    - **language** – a selector function that returns the active language from the state.
    - **render** – a `React.FC<LabelComponentProps>` where `type LabelComponentProps = { text: string }`. It injects the correct label as the `text` prop.

2.  **`mkUseLabel`**: A factory function that creates a React hook.

    - It expects the **same `language` selector** as `connectLabels`.
    - It returns the **`useLabel`** hook. This hook takes an `item` key as an argument (`useLabel("itemKey")`) and returns the corresponding label string. The hook is **reactive**: if the language changes in the state, the component using the hook will re-render with the new label. Ideal for props like `placeholder`, `aria-label`, `title`, etc.

3.  **`getLabel`**: A simple function for direct access.
    - Syntax: `getLabel(item: keyof items, language?: string): string`.
    - It takes the item key and optionally a language.
    - If `language` is provided and valid, it returns the label for that language.
    - If `language` is omitted or invalid, it uses the language defined in `fallback`.
    - This function is **not reactive** to state changes and can be used outside of React or when reactivity is not needed.

### Behaviour and edge-case handling

- **Language selection**

  - For `connectLabels` and `useLabel` (via `mkUseLabel`), the selector `(state: RootState) => string` determines the active language. If the returned language is not listed in `options`, the text automatically falls back to the language defined in `fallback`, ensuring the UI always displays a valid label and reacts to state changes.
  - For `getLabel`, if the `language` argument is not provided or is not in `options`, the `fallback` language is used.

- **Extensibility**
  - To add a new language, simply add its key to `options` and define the corresponding labels for every item in `items` that requires a specific translation.

## Icons

The **`Icons`** utility is designed to manage icons tailored to different themes (e.g. light and dark) by centralising their configuration.

With **`Icons`**, you can:

- Define theme-specific icons.
- Control icon properties (size and colour) via dedicated types.
- Ensure that the displayed icon always matches the application’s active theme.

### Syntax and configuration

Valid icon properties are:

```ts
type IconColors =
  | "error"
  | "disabled"
  | "action"
  | "inherit"
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning";

type IconSize = "small" | "medium" | "large";

/** If both are set, customSize wins (explicit > implicit). */
type IconComponentProps = {
  size?: IconSizePreset;
  /** CSS length (px|em|rem|%, etc.). */
  customSize?: string;
  color?: IconColors;
};
```

```tsx
import { State } from "scalux";
import { IconComponentProps } from "scalux/helpers";
import { EditIconDark, EditIconLight, DeleteIcon } from "./icons";

const { Icons } = State({ theme: "light" });

const { connectIcons } = Icons({
  options: ["light", "dark"], // Supported themes
  default: "light", // Default theme
  items: {
    Edit: {
      light: EditIconLight, // Component for light theme
      dark: EditIconDark, // Component for dark theme
    },
    Delete: DeleteIcon, // Same icon for every theme
  },
});

const AppIcon = connectIcons({
  theme: (state) => state.theme,
});

const IconsDisplay = () => (
  <div>
    <AppIcon item="Edit" />
    <AppIcon item="Delete" />
  </div>
);
```

### Code walkthrough

The `Icons` constructor (returned by `State`) receives a configuration object containing:

- **options** – the tuple of supported themes.
- **default** – the default theme (must be one of `options`).
- **items** – a dictionary where each key maps to either
  - a `React.FC<IconComponentProps>`, or
  - an object that assigns a theme-specific icon component for each theme.

`Icons` returns **`connectIcons`**, which expects:

- **theme** – a selector function that returns the active theme from the state.

### Behaviour and edge-case handling

- **Theme selection**  
  The selector `(state: RootState) => string` determines the active theme. If the returned theme is not listed in `options`, the icon automatically falls back to the theme specified in `default`, ensuring the UI always displays a valid icon.

- **Extensibility**  
  To add a new theme, just include its key in `options` and define icons for every item in `items`.

### Generating custom icons from SVG files

To simplify creating and using icons from static SVG files, **`scalux`** offers the `svgIconBuilder` utility. This tool converts your SVG files into React components that conform to `React.FC<IconComponentProps>`, making integration straightforward.

#### How it works

`svgIconBuilder` takes the relative path to the directory containing your static SVG files.  
It then combines with the `.useIcons` method, which expects an object mapping each icon name to its corresponding SVG filename (without the extension).

#### Practical example

With Vite, static files usually reside in `/public`. To create icons from `/public/svg/save.svg` and `/public/svg/open.svg`:

```ts
import { svgIconBuilder } from "scalux/helpers";

const { Save, Open } = svgIconBuilder("/svg").useIcons({
  Save: "save",
  Open: "open",
});
```

`Save` and `Open` are now of type `React.FC<IconComponentProps>`.
