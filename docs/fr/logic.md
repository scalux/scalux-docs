# Logic, Composants & API

L’API de scalux repose sur **la progressivité**. Elle propose, pour chaque macro-fonctionnalité, plusieurs niveaux d’abstraction – généralement deux ou trois – afin d’accompagner la croissance naturelle de votre application.

Dans les sections précédentes, nous avons vu deux manières d’organiser la logique d’un composant :

- La méthode “tout-en-un” via `Component` pour des cas simples et rapides à mettre en place.
- L’approche intermédiaire introduisant `Resolver`, `Updater` et `Thunk`, qui permettent d’extraire la logique métier du composant, favorisant ainsi la lisibilité et la réutilisabilité dans des projets de taille moyenne.

Dans cette partie, nous introduisons une troisième approche avec `Logic`, conçue pour les applications ambitieuses et/ou modulaires. Elle vous permettra de centraliser, typer et organiser hiérarchiquement toute votre logique métier, en dehors des composants React.

**Objectifs**

À la fin de cette section, vous saurez :

- Comment externaliser complètement votre logique métier, indépendamment de l’interface utilisateur.
- Comment réutiliser cette logique dans des contextes variés (tests, services, workers, etc.).
- Comment générer automatiquement une API typée pour interagir avec votre application sans dépendance à React.

## Logic

Le retour de State expose également un constructeur nommé `Logic`.
Celui-ci prend en paramètre un arbre dont chaque feuille est une valeur générée via `Resolver` (ou tout sélecteur de l'état avec au maximum un paramètre) ou `Thunk`.

Logic est une fonction de typage : elle ne modifie pas l’arbre, mais en valide la structure, assurant que chaque feuille respecte bien le contrat attendu (`Resolver` ou `Updater`). Elle facilite ainsi l’organisation et la lisibilité de votre logique métier.

## Composants

À mesure que votre application grandit, certains **sélecteurs** (`Resolver`) et **handlers** (`Updater`, `Thunk`) deviennent partagés entre plusieurs composants. Dans ce cas, il est recommandé de les externaliser hors des dossiers de composants individuels, dans un répertoire dédié comme `logic`.

Étant donné que `Logic` est purement une fonction de typage et ne modifie pas les objets passés, il permet de **composer librement les arbres de logique**. Vous pouvez ainsi organiser vos sélecteurs et handlers de manière **hiérarchique** et **modulaire**, et les regrouper dans un objet **centralisé** (`logic`), ce qui améliore la maintenabilité.

### Version 2 du "Plus ou Moins"

```typescript
// src/state.ts

import { State, Undoable } from "scalux";

//  État initial avec historisation (undo/redo)
export const { Component, Updater, Resolver, undo, redo, register } = State(
  Undoable({
    targetValue: null as number | null,
    userValue: 50,
  })
);
```

```typescript
// src/logic.ts
import { Updater, Resolver, undo, redo, Logic } from "./state";

// Handlers externes explicites
const increment = Updater(({ userValue }) => ({ userValue: userValue + 1 }));
const decrement = Updater(({ userValue }) => ({ userValue: userValue - 1 }));
const setTargetValue = Updater((_, targetValue: number) => ({ targetValue }));

const fetchTargetValue = Updater(async () => {
  const response = await fetch(
    "https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new"
  );
  const text = await response.text();
  return { targetValue: parseInt(text.trim(), 10) };
});

const guessComponentData = Resolver((state) => ({
  userValue: state.present.userValue,
  targetValue: state.present.targetValue,
}));

// Arbre logique
const logic = Logic({
  targetValue: {
    setTargetValue,
    fetchTargetValue,
  },
  userValue: { increment, decrement },
  history: { undo, redo },
  components: {
    guessComponentData,
  },
});

export { logic };
```

```tsx
// src/GuessComponent.tsx
import { logic } from "./logic";
import { Component } from "./state";

type GuessComponentProps = {
  userValue: number;
  targetValue: number | null;
  increment: () => void;
  decrement: () => void;
  fetchTargetValue: () => void;
  undo: () => void;
  redo: () => void;
};

// Composant de rendu React
const GuessComponent = ({
  userValue,
  increment,
  decrement,
  fetchTargetValue,
  undo,
  redo,
  targetValue,
}: GuessComponentProps) => {
  useEffect(() => {
    if (targetValue === null) fetchTargetValue();
  }, [targetValue]);

  const hint =
    targetValue === null
      ? "Chargement..."
      : userValue < targetValue
      ? "C'est plus"
      : userValue > targetValue
      ? "C'est moins"
      : "Bravo, tu as trouvé ! 🎉";

  return (
    <div>
      <h3>Valeur : {userValue}</h3>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
      <p>{hint}</p>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
};

// Assemblage final avec Updates et sélecteurs
const GuessNumberApp = Component({
  domain: "GuessNumber",
  render: GuessComponent,
  data: logic.components.guessComponentData,
  handlers: {
    increment: logic.userValue.increment,
    decrement: logic.userValue.decrement,
    undo: logic.history.undo
    redo: logic.history.redo,
    fetchTargetValue: logic.targetValue.fetchTargetValue
  },
});

const { reducer, mkApi } = register(logic);

export { GuessNumberApp, reducer, mkApi };
```

```typescript
// src/store.ts
import { configureStore } from "scalux";
import { reducer, mkApi } from "./GuessComponent";

export const store = configureStore({
  reducer,
});

const api = mkApi(store);
```

## Api

La fonction `register`, issue de `State`, accepte en option l’objet `logic`.

Elle retourne un objet contenant :

- `reducer` : le réducteur Redux à intégrer dans votre store

- `mkApi(store)` : une fonction qui, une fois appelée avec un store, retourne une API typée dérivée de votre arbre logic

### Structure de l’API retournée

```typescript
const api = mkApi(store);
```

L’objet `api` contient :

- `app` : un miroir de l’arbre logic

  - Chaque `Value` devient un getter calculé à la volée depuis le state (ou une fonction d'un paramètre : la payload)
  - Chaque `Handler` devient une fonction qui dispatch une action typée selon la convention `api/path/to/handler`
  - Chaque `Thunk` devient également une fonction

  Les méthodes et sélecteurs de `app` sont asynchrones si le resolver ou la fonction de mise à jour de l'arbre sont asynchrones.

- `state` : L’ensemble des sélecteurs automatiques générés à partir de l’état initial sous forme de getter, qui offre un accès direct aux propriétés de base de votre état.

### Exemple

```typescript
// index.ts
import { api } from "./store";

// Exemple d'utilisation de l'API

// Dispatch d'une action d'incrémentation
api.app.userValue.increment();

// Accès à la valeur actuelle de userValue via le getter
console.log(
  "Valeur de userValue après incrémentation :",
  api.state.pick.userValue
);

// Exemple d'appel d'une requête asynchrone pour récupérer targetValue
api.app.targetValue.fetchTargetValue().then(() => {
  console.log("Valeur de targetValue récupérée :", api.state.pick.targetValue);
});
```

### Cas d’usage

L’API de scalux s’adresse aux scénarios où la centralisation et la standardisation de l’accès à l’état et aux handlers sont particulièrement bénéfiques. Voici quelques cas d’usage typiques :

**✅ Tests unitaires sans mock de React ou Redux**

L’API permet de tester la logique d’un composant ou d’un service sans passer par une couche UI :

```typescript
test("l'incrément atteint la cible", () => {
  api.app.targetValue.setTargetValue(53);
  api.app.userValue.increment();
  api.app.userValue.increment();
  api.app.userValue.increment();

  expect(api.state.pick.userValue).toBe(api.state.pick.targetValue); // true
});
```

**✅ Services / Workflows métiers**

Dans une application complexe, il peut être nécessaire d’interroger l’état ou de dispatcher des actions depuis des modules non-UI (ex. utilitaires, services).
Vous pouvez appeler `api.app.*`. et `api.state.*` dans des services sans dépendre de React ou Redux.

**✅ Intégration avec des effets externes (WebSocket, Workers)**

On peut manipuler l’état global en réponse à des événements asynchrones externes :

```typescript
socket.on("updateScore", (score) => {
  api.app.targetValue.setTargetValue(score);
});
```

**✅ Debug, scripts temporaires, visualisation**

```typescript
console.log("État courant :", api.state.getState);
api.app.userValue.increment();
```
