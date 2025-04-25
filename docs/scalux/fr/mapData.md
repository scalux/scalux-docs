# Connexion des données : `Resolver`

## Rappels sur `Component`

Le constructeur `Component` issu de `State` permet de connecter de manière _typesafe_ un composant React fonctionnel à ses données et à ses modificateurs d'état.

### Configuration

`Component` en paramètre un objet de configuration avec quatre propriétés :

- **domain** : nom unique dans l'application qui préfixe les types des actions dispatchées depuis le composant : `componentDomain/action1`, `componentDomain/action2`, etc.
  Une erreur d'initialisation détecte la duplication d'un `domain` en en précisant la source.

- **render** : le composant React fonctionnel responsable de l'affichage des données qui lui sont fournies

- **data** : propriété permettant de connecter le composant à ses données (les `DataProps`)

- **handlers** : propriété permettant de connecter le système événementiel du composant aux modificateurs d'état de l'application via ses `HandlerProps`

### `DataProps` et `HandlerProps`

- Les `HandlerProps` sont les _props_ du composant de type:

  ```typescript
  () => void | ((payload: Payload) => void)
  ```

  Chacune de ces propriétés sera associée sous la clé **handlers** de `Component` à un handler qui permettra:

  - d'interragir avec l'état (et souvent de le modifier)
  - d'initier des requêtes API (web API, worker)
  - d'effectuer des effets de bord (intéraction avec le système de fichier par exemples)

- Les `DataProps`sont le complémentaire des `HandlerProps`: toute propriété qui n'appartient pas à `HandlerPros` appartient à `DataProps`.

**Exemple**

Pour un composant de type :

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

Ses `DataProps` (les données affichées) sont :

```typescript
type TodoListDataProps = {
  todos: { id: string; label: string; done: boolean }[];
  filter: "all" | "active" | "completed";
};
```

Ses `HandlerProps` (les actions utilisateur) sont :

```typescript
type TodoListHandlerProps = {
  addTodo: (label: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: "all" | "active" | "completed") => void;
};
```

La suite de cette section présente comment connecter un composant à ses données via la propriété **data** :
à l'aide d'un **objet statique** ou d'un **sélecteur dynamique**.

## Connection par objet statique

La propriété **data** accepte tout simplement un objet de type `DataProps` : ce cas d'usage se manifeste en phase de prototypage pour établir un placeholder lorsque les données de l'état nécessaires n'ont pas encore toutes été définies ou lorsque le composant nécessite uniquement une connexion à l'état pour ses handlers mais que ses données sont constantes (par exemple un composants de dimensions fixes qui observe uniquement la position du curseur et les clics de l'utilisateur).

Le composant obtenu est alors de type `React.FC` et directement utilisable dans le JSX sans `props` supplémentaires.

**Exemple**:

```typescript
type XY = { x: number; y: number };

type SensorProps = {
  width: number;
  height: number;
  onPointerMove: (pos: XY) => void;
  onPointerDown: (pos: XY) => void;
};

const AppSensor: React.FC = Component({
  // définition de domain, render, handlers
  // ...
  // data définies directement pas un objet statique
  data: {
    width: 500,
    height: 300,
  },
});
```

```tsx
// Utilisation dans le JSX
<AppSensor />
```

### Gestion des OwnProps

Les `OwnProps` sont les propriétés passées directement au composant via JSX par son parent.
Leur usage devient nécessaire lorsque les données dépendent d’informations spécifiques fournies par le parent (par exemple, l’identifiant d’un élément dans une liste d'items ou des paramètres d’affichage dynamiques).

Si vous passez un **objet statique partiel** à **data**, les propriétés des `DataProps` manquantes deviennent automatiquement les `OwnProps` attendues par le composant.

**Exemple avec OwnProps**:

```typescript
type XY = { x: number; y: number };

type SensorProps = {
  width: number;
  height: number;
  onPointerMove: (pos: XY) => void;
  onPointerDown: (pos: XY) => void;
};

// data reçoit un objet statique vide
// Les DataProps width et height sont manquantes
// Elles doivent être passées au JSX (OwnProps) pour utiliser le composant
const AppSensor: React.FC<{ width: number; height: number }> = Component({
  // définition de domain, render, handlers
  // ...
  data: {},
});
```

```tsx
// Utilisation dans le JSX
<AppSensor width={500} height={300} />
```

## Connection avec un sélecteur dynamique :

La propriété **data** peut également recevoir un sélecteur :

```typescript
(state: RootState, ownProps: OwnProps) => DataProps;
```

C'est l'approche utilisée dans la majorité des exemples jusqu'ici.
Passer un objet au deuxième paramètre permet de définir des `OwnProps`.

### Resolver

L'approche de création _inline_ des sélecteurs utilisée jusqu'ici fonctionne bien avec les cas simples (il est inutile d'externaliser `{ data: (state) =>({ value: state.counter }) }` par exemple).

Pour les cas plus élaborés, le constructeur `Resolver` est également en retour de la fonction `State`.

Il reçoit un sélecteur dont le premier paramètre est le `RootState`, typé par inférence, éventuellement un deuxième paramètre (pour les ownProps dans ce cas d'usage) et le renvoie.

**Exemple avec Resolver et OwnProps**

```tsx
import { State } from "scalux";

// État initial
const { Component, Resolver, register } = State({
  counters: {
    counterA: 0,
    counterB: 10,
  },
});

type CounterName = "CounterA" | "CounterB";

type NamedCounterProps = {
  name: CounterName;
  value: number;
  increment: (name: string) => void;
  decrement: (name: string) => void;
};

// Composant affichant un compteur nommé
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

// Définition du resolver
const selectCounterByName = Resolver(
  (state, ownProps: { name: CounterName }) => ({
    value: state.counters[ownProps.name],
  })
);

// Assemblage du composant connecté utilisant Resolver
const NamedCounterComponent = Component({
  domain: "NamedCounter",
  render: NamedCounter,

  // Sélection dynamique via Resolver
  data: selectCounterByName,

  handlers: {
    increment: (state, name) => ({
      counters: { [name]: state.counters[name] + 1 },
    }),

    decrement: (state, name) => ({
      counters: { [name]: state.counters[name] - 1 },
    }),
  },
});

// Enregistrement final
const { reducer } = register();

export { NamedCounterComponent, reducer };
```

```tsx
// Utilisation dans le JSX
<NamedCounterComponent name="counterA" />
<NamedCounterComponent name="counterB" />
```

## Wrap-up

Dans cette partie, nous avons vu :

✅ **Toutes les options pour connecter un composant à ses données** :

- avec un **objet statique**
- par un **selecteur dynamique**
- en **utilisant des OwnProps**
