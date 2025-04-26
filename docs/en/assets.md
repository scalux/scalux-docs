# Assets: `Labels` and `Icons`

This section introduces two utilities provided by **`scalux`** that make it easy to centrally manage multilingual text content (wording) and icons adapted to different themes. These tools integrate seamlessly with your state logic and guarantee a consistent user experience.

## Labels

The `Labels` utility lets you define and use labels according to the language currently active in the application.

With **`Labels`**, you can:

- Centralise textual labels.
- Easily handle several languages.
- Guarantee a consistent interface when a language is undefined (by falling back to the default language).

### Syntax and configuration

```tsx
import { State } from "scalux";
import { LabelComponentProps } from "scalux/helpers";

const { Labels } = State({ language: "fr" });

const { connectLabels } = Labels({
  options: ["fr", "en"], // Supported languages
  fallBack: "en", // Default language
  items: {
    Tool: {
      fr: "Outil",
      en: "Tool",
    },
    Edit: "Edit",
    Design: "Design",
  },
});

const Title = ({ text }: LabelComponentProps) => <h1>{text}</h1>;

const AppTitle: React.FC<{ item: "Tool" | "Edit" }> = connectLabels({
  language: (state) => state.language,
  render: Title,
});

const Titles = () => (
  <div>
    <AppTitle item="Tool" /> // <h1>Outil</h1>
    <AppTitle item="Edit" /> // <h1>Edit</h1>
  </div>
);
```

### Code walkthrough

The `Labels` constructor (returned by `State`) receives a configuration object containing:

- **options** – the tuple of supported languages.
- **fallback** – the default language (must be one of `options`).
- **items** – a dictionary where each key maps to either
  - a static string (used for all languages), or
  - an object that assigns a specific label for each language.

`Labels` returns **`connectLabels`**, which expects:

- **language** – a selector function that returns the active language from the state.
- **render** – a `React.FC<LabelComponentProps>` where  
  `type LabelComponentProps = { text: string }`.

### Behaviour and edge-case handling

- **Language selection**  
  The selector `(state: RootState) => string` determines the active language. If the returned language is not listed in `options`, wording automatically falls back to the language defined in `fallback`, ensuring the UI always displays a valid label.

- **Extensibility**  
  To add a new language, simply add its key to `options` and define labels for every item in `items`.

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

type IconComponentProps = { color?: IconColors; size?: IconSize };
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
