# Bases

Voici comment démarrer une application `React-Redux` complète en quelques lignes avec `scalux` à l’aide d’un exemple minimal de compteur.

Vous découvrirez sur cette page comment :

- définir l’état initial d'une application
- connecter un composant à cet état
- construire le store Redux.

## Le compteur

L’exemple ci-dessous illustre la configuration d’un compteur avec :

- L’état initial via généré via `State`
- Un composant connecté généré par `Component`
- L’assemblage du store Redux grâce à `register` et `configureStore`

### Étape 1 : Définition l’état initial et connection des composants

```tsx
// src/app.tsx
import { State } from "scalux";

// Crée l'état initial et génère les constructeurs
// L'état doit être un objet (pas une valeur primitive)
const { Component, register } = State({ count: 0 });

// Définition du composant d’affichage
type CounterProps = {
  value: number;
  increment: () => void;
  decrement: () => void;
};

const Counter = ({ value, increment, decrement }: CounterProps) => (
  <div>
    <div>
      <button aria-label="Increment value" onClick={() => increment()}>
        Increment
      </button>
      <span>{value}</span>
      <button aria-label="Decrement value" onClick={() => decrement()}>
        Decrement
      </button>
    </div>
  </div>
);

// Assemblage du composant connecté
const CounterComponent: React.FC = Component({
  domain: "Counter", // Préfixe des types d’actions (ex: "Counter/increment")
  render: Counter,
  data: (state) => ({ value: state.count }),
  handlers: {
    increment: (state) => ({ count: state.count + 1 }),
    decrement: (state) => ({ count: state.count - 1 }),
  },
});

// Enregistre les handlers dans Redux et génère le reducer.
// register doit être appelée une fois tous les composants définis.
const { reducer } = register();

export { CounterComponent, reducer };
```

### Étape 2 : Créer le store

```typescript
// src/store.ts
import { reducer } from "./app";
// scalux réexporte la méthode configureStore de redux-toolkit
import { configureStore } from "scalux";
// Exemple d’ajout de middleware personnalisé
import { userDefinedMiddleware } from "./middlewares";

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleWare) => getDefaultMiddleWare(),
});
```

### Étape 3 : Utiliser le composant dans l’application

```tsx
// src/main.tsx

// ré-export du Provider de react-redux;
import ReactDOM from "react-dom/client";
import { Provider } from "scalux";
import { CounterComponent } from "./components";
import { store } from "./store";

ReactDOM.createRoot(
  document.getElementById("root").render(
    <Provider store={store}>
      <CounterComponent />
    </Provider>
  )
);
```

La suite de cette page détaille chacun de ces concepts.

## State

- `State`, exporté par `scalux`, définit l’état initial à partir d’un objet de données sérialisables.
- Le type de l’état est inféré, et des annotations de types peuvent être utilisées pour gérer des cas plus complexes (ex. types union).

## Component

Le constructeur `Component` en retour de `State` permet de connecter un composant à l'état de l'application.

Il prend un objet de configuration avec les propriétés suivantes :

- **domain**: Chaîne de caractères utilisée comme préfixe pour les types d’actions générés. **Aucune action à définir manuellement.**

  _Exemple : Les handlers increment et decrement génèrent respectivement les action types Counter/increment et Counter/decrement_

  **Note** : Le domaine doit être unique dans l’application. Une duplication ne restera pas silencieuse : elle déclenchera une erreur d'initialisation avec un message de debug pour en trouver facilement l'origine.

- **render** : Composant React fonctionnel dont le typage des props est essentiel.

  `scalux` sépare par inférence les propriétés du composant en deux catégories

  - Les `HandlerProps` de type:
    ```typescript
    (payload: SomePayload) => void | () => void
    ```
    Gérées par la propriété `handlers` de `Component`.
  - les `DataProps`: le reste des propriétés.
    Gérées par la propriété `data` de `Component`

- **data** : recoit un sélecteur dont le premier paramètre est l'état, typé par inférence et renvoie les `DataProps`

  ```typescript
  (state: RootState) => DataProps;
  ```

- **handlers** : reçoit pour chaque `HandlerProp` une fonction de modification de l'état typée par inférence, dont le premier
  paramètre et l'état, le second une évenutelle `Payload` et renvoie un objet de mise à jour de l'état:

  ```typescript
    (state: RootState, payload: HandlerNPayload) => Partial<InternalState>,
  ```

  Dans l'exemple :

  - Les handlers `increment` et `decrement` mettent à jour la propriété `count`
  - les payloads sont égales à `undefined` (car les handlers sont de type `() => void`)
  - `InternalState` vaut `RootState`: `InternalState` diffère de `RootState` dans des cas complexes (gestion d'un historique), mais cette distinction est importante pour la suite

  - Chaque handler retourne un sous ensemble de l'état interne contenant les propriétés modifiées.
    Si nous avions eu une handlerProp `{ doNothing : () => void}` alors `{ doNothing: () => ({}) }` est valide.

## register

La fonction `register` enregistre tous les reducers générés par les handlers des composants.

**⚠️ Important** :

- Appelez `register` **après** avoir défini tous vos composants connectés via `Component`.
- Un moyen (facultatif) de s'en assurer est d'appeler `register` dans un fichier d'où sont exportés tous les composants.
- Le reducer retourné est ensuite utilisé pour configurer le store Redux.

Par exemple :

```typescript
// enregistre tous les handlers définis précédemment
const { reducer } = register();

// exporte le reducer pour construire le store
export { CounterComponent, reducer };
```

## Wrap-up

Dans cette partie nous avons vu comment :

✅ **définir un état minimaliste** : via `State`

✅ définir un composant pour rendre le modèle **en séparant les données (`DataProps`) des handlers (`HandlerProps`)**

✅ **connecter un composant** à l'état et **définir ses action types** en assemblant le composant de rendu avec :

- un domaine
- un sélecteur de données
- des handlers

Cette approche simple convient aux cas d’usage courants. Pour des applications plus complexes, scalux offre des outils avancés qui permettent de :

- Découper l’état en tranches, gérer l’historique et modéliser des automates.
- Alimenter les composants via différents types de sélecteurs : données en dur, sélecteurs générés depuis l'état initial, techniques de mémoïsation, gestion des ownProps.
- Expose des méthodes d'externalisation pour éviter de centraliser trop de handlers dans un seul objet.
