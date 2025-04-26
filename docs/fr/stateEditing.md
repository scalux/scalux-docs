# Modifications de l'état : `Updater` et `Thunk`

Les intéractions des composants avec l'état de l'application sont gérées via les constructeurs `Updater` et `Thunk` en retour de `State`.

`Updater` supporte deux manières d'intéragir avec l'état :

- en renvoyant un arbre partiel de mise à jour de l'état : votre _go to_ pour les cas simples
- avec un dictionnaire de réducteurs après un éventuel pré-processing de la donnée qu'ils reçoivent

`Thunk` permet reçoit un thunk Redux qu'elle permet de typer d'après l'état initial.

## Connection avec un arbre partiel

`Updater` reçoit une fonction de type :

```typescript
(state: RootState, payload: Payload) => DeepPartial<InternalState>;
```

Son premier paramètre est l'état global, son deuxième une payload (qui peut être laissée undefined) et elle renvoie un sous-arbre de `InternalState` dont les feuilles sont les propriétés de l'état à modifier.

```typescript
import { State } from "scalux";

// Updater est en retour de State, comme Component
const { Component, Updater, Resolver } = State({
  UserDetails: {
    name: "John Doe",
    hasDriverLicense: true,
  },
});

type UserDetailsComponentProps = {
  name: string;
  editName: (name: string) => void;
  toggleDriverLicense: () => void;
};

// Externalisation de la logique du composant

// Le premier paramètre RootState, n'est pas utilisé ici
const editName = Updater((_, name: string) => ({ UserDetails: { name } }));

// Le paramètre RootState est typé par inférence
// Aucune payload n'est utilisée en second paramètre
const toogleDriverLicense = Updater((state) => ({
  UserDetails: { hasDriverLicense: !state.UserDetails.hasDriverLicense },
}));
```

### Gestion des requêtes asynchrones

La fonction de mise à jour peut être définie en tant que fonction asynchrone utilisant async/await

### Exemple d'une application de dés avec requête API

```tsx
import { State } from "scalux";

const { Updater, Component, register } = State({ value: null });

type DieRollerProps = {
  value: number | null;
  roll: () => void;
};

const DieRoller = ({ value, roll }: DieRollerProps) => (
  <div>
    <div>
      {value !== null ? <span>{value}</span> : "Not played yet!"}
      <button aria-label="Roll the die" onClick={() => roll()}>
        Roll!
      </button>
    </div>
  </div>
);

const roll = Updater(async () => {
  const response = await fetch(
    "https://www.random.org/integers/?num=1&min=1&max=6&col=1&base=10&format=plain&rnd=new"
  );
  const text = await response.text();
  const value = parseInt(text.trim(), 10);
  return { value };
});

const AppDieRoller = Component({
  domain: "Die",
  render: DieRoller,
  data: Data((state) => ({ value: state.value })),
  handlers: {
    roll,
  },
});
```

## Connection avec un thunk

Un **thunk** est une fonction curryfiée dont le premier paramètre est une payload et qui renvoie une fonction recevant les fonctions `dispatch` et `getState` du store redux.

```typescript
const thunk: (
  payload: Payload
) => (dispatch: (action: AnyAction) => void, getState: () => RootState) => void;
```

Le constructeur `Thunk` reçoit un thunk qu'il permet de connecter à l'état.

Cela permet de dispatcher des actions personnalisées échappant à la nomenclature :

```typescript
{
    payload: HandlerPayload,
    type: "componentDomain/handlerName"
}
```

C'est par exemple utile pour déclencer des actions agissant sur le `RootState` (état global) et non l'état interne des slices via des réducteurs d'ordre supérieur : un des cas d'usage est l'historisation.

### Gestion de l'historique (undo/redo)

Les `ActionCreators` de `redux-undo` :

- undo
- redo
- jump
- jumpToPast
- jumpToFuture
- clearHistory

sont exportés par scalux sous le nom `history`.

D'après ce qui précède, les fonctionnalités d'historique peuvent être implémentées comme suit :

```typescript
import { history, State } from "scalux";

const { Thunk } = State({
  // définition de l'état
});

const undo = Thunk(() => (dispatch) => dispatch(history.undo()));
const redo = Thunk(() => (dispatch) => dispatch(history.redo()));

const jump = Thunk(
  (steps: number) => (dispatch) => dispatch(history.jump(steps))
);

const jumpToPast = Thunk(
  (index: number) => (dispatch) => dispatch(history.jumpToPast(index))
);

const jumpToFuture = Thunk(
  (index: number) => (dispatch) => dispatch(history.jumpToFuture(index))
);

const clearHistory = Thunk(
  () => (dispatch) => dispatch(history.clearHistory())
);
```

Dans la majorité des cas, ce sont les fonctionnalités `undo` et `redo` qui seront utilisées : les thunks `undo` et `redo` sont directement exposés en retour de `State`, permettant l'intégration des fonctionnalités undo/redo en une ligne.

## Utilisation de reducers

La modification de l'état avec un arbre de mise à jour qui a été utilisée dans les exemples jusqu'ici est la méthode la plus simple et la plus expressive mais elle présente des limites :

- elle peut devenir moins lisible lorsqu'il s'agit de modifier plusieurs valeurs profondes dans des branches éloignées

- cette approche peut être déroutante pour les développeurs débutant avec `scalux`

- dans le cas où une donnée de l'état est stockée sous forme de dictionnaire (par exemple un dictionnaire de todos), un arbre de mise à jour permet de modifier des éléments, d'en ajouter mais pas d'en supprimer !

### Principe

Pour traiter ces cas, `Updates` accepte également un objet de configuration à deux clés :

- **resolve** : reçoit une fonction, éventuellement asynchrone dont le premier paramètre est le `RootState` et le second la payload du hander. La propriété **resolve** peut bien sûr être construite à l'aide du constructeur `Resolver`.
  ```typescript
  (state: State, payload: HandlerPayload) => RevolerReturn;
  ```
- **updates** :

  - **Etat simple**: une fonction de mise à jour
    ```typescript
    (state: RootState, payload: ResolverReturn) => void
    ```
    Elle reçoit l'état global, la payload en retour de **resolve** et modifie l'état avec la dot notation (ne retourne rien, l'immutabilité est assurée par **Immer**).
  - **Etat slicé**

    Reçoit un dictionnaire de fonctions de mise à jour : une clé pour chaque slice impactée (les slices non impactées peuvent être ignorée)

    ```typescript
    {
      slice1: (state: RootState, payload: ResolverReturn) => void,
      // slice2 ignorée
      slice3: (state: RootState, payload: ResolverReturn) => void
      // autres fonctions de modification
    }
    ```

## Wrap-up

Dans cette partie, nous avons vu :

✅ **La gestion des requêtes asynchrones** dans les handlers : support de `async/await`

✅ **L'utilisation de thunks de Redux** pour dispatcher des actions personnalisées

✅ **L'intégration de l'historisation** : `history` pour les cas complexes, les one-liners `undo` et `redo` pour la majorité des cas

✅ **Comment sortir la logique de l'application du constructeur Component** et gérer des intéractions complexes avec l'état : `Updater` avec `Resolver`.
