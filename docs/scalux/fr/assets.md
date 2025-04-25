# Assets : `Labels` et `Icons`

Cette section présente deux utilitaires proposés par `scalux` pour faciliter la gestion centralisée des contenus textuels multilingues (wording) et des icônes adaptées à différents thèmes. Ces outils s’intègrent aisément dans votre logique d’état et garantissent une expérience utilisateur cohérente.

## Labels

L'utilitaire `Labels` permet de définir et d'utiliser des libellés en fonction de la langue active dans l'application.

Avec `Labels`, vous pouvez :

- Centraliser les libellés textuels.

- Gérer facilement plusieurs langues.

- Assurer une interface toujours cohérente en cas de langue non définie (en basculant sur la langue par défaut).

### Syntaxe et configuration

```tsx
import { State } from "scalux";
import { LabelComponentProps } from "scalux/helpers";

const { Labels } = State({ language: "fr" });

const { connectLabels } = Labels({
  options: ["fr", "en"],
  fallBack: "en",
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

### Explications du code

Le constructeur `Labels` en retour de `State` reçoit un objet de configuration avec :

- **options**: le tuple des langues gérées.
- **fallback**: la langue par défaut (doit appartenir à options).
- **items**: un dictionnaire définissant pour chaque clé :
  - Soit une chaîne de caractères statique (utilisée pour toutes les langues).
  - Soit un objet associant chaque langue à un libellé spécifique.

`Labels` retourne le connecteur `connectLabels` qui attend en configuration :

- language: une fonction sélecteur qui retourne la langue active depuis l'état.
- render: un composant `React.FC<LabelsComponentProps>` avec `type LabelsComponentProps = {text: string}`

### Fonctionnement et gestion des cas particuliers

- Sélection de la langue :
  Le sélecteur `(state: RootState) => string` permet de déterminer la langue active. Si la langue retournée n'est pas définie dans options, le wording bascule automatiquement sur la langue spécifiée en default. Cela garantit que l’interface affiche toujours un libellé valide.

- Extensibilité :
  Pour ajouter une nouvelle langue, il suffit d’ajouter la clé correspondante dans le tuple options et de définir les libellés pour chaque item dans items.

## Icons

L'utilitaire Icons est conçu pour gérer des icônes adaptées à différents thèmes (par exemple, clair et sombre) en centralisant leur configuration.

Avec `Icons`, vous pouvez :

- Définir des icônes spécifiques pour différents thèmes.

- Contrôler les propriétés (taille et couleur) de vos icônes via des types dédiés.

- Assurer que l’icône affichée correspond toujours au thème actif de l’application.

### Syntaxe et configuration

Les icônes peuvent être personnalisées selon leur couleur et leur taille. Les types suivants sont utilisés :

```typescript
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
  options: ["light", "dark"], // Thèmes gérés
  default: "light", // Thème par défaut
  items: {
    Edit: {
      light: EditIconLight, // Composant pour le thème clair
      dark: EditIconDark, // Composant pour le thème sombre
    },
    Delete: DeleteIcon, // Icône unique utilisée pour tous les thèmes
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

### Explications du code

Le constructeur `Icons` en retour de `State` reçoit un objet de configuration avec :

- **options**: le tuple des thèmes gérés.
- **default**: le thème par défaut (doit appartenir à options).
- **items**: un dictionnaire définissant pour chaque clé :
  - Soit un composant de type `React.FC<IconComponentProps>`
  - Soit un objet associant chaque thème à une icône spécifique.

`Icons` retourne le connecteur `connectIcons` qui attend en configuration :

- theme: une fonction sélecteur qui retourne le theme actif depuis l'état.

### Fonctionnement et gestion des cas particuliers

- Sélection du thème :
  Le sélecteur `(state: RootState) => string` permet de déterminer le thème actif. Si le thème retourné n'est pas définie dans options, l'icone bascule automatiquement sur le thème spécifiée en default. Cela garantit que l’interface affiche toujours une icône valide.

- Extensibilité :
  Pour ajouter un nouveau thème, il suffit d’ajouter la clé correspondante dans le tuple options et de définir les libellés pour chaque item dans items.

### Génération d'icônes personnalisées à partir de fichiers SVG

Pour simplifier la création et l'utilisation d'icônes à partir de fichiers SVG statiques, `scalux` propose l'utilitaire `svgIconBuilder`. Cet outil convertit vos fichiers SVG en composants React conformes à l'interface `React.FC<IconComponentProps>`, facilitant ainsi leur intégration dans votre application.

#### Fonctionnement

L'utilitaire `svgIconBuilder` reçoit en paramètre le chemin relatif vers le répertoire contenant vos fichiers statiques.

Il se combine ensuite avec la méthode `.useIcons`, laquelle attend un objet associant chaque nom d’icône au nom du fichier SVG correspondant (sans extension).

#### Exemple pratique

Sous Vite, le dossier des fichiers statiques se trouve généralement dans `/public`. Pour créer des icônes à partir des fichiers `/public/svg/save.svg` et `/public/svg/open.svg`, procédez comme suit :

```typescript
import { svgIconBuilder } from "scalux/helpers";

const { Save, Open } = svgIconBuilder("/svg").useIcons({
  Save: "save",
  Open: "open",
});
```

Save et Open sont de type `React.FC<IconComponentProps>`.
