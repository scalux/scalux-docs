# Exemple Complet : Application Todo List

Cet exemple illustre la création d'une application Todo List complète avec `scalux`, intégrant :

- La récupération de données depuis une API (simulée).
- La gestion de l'état (ajout, basculement, suppression de tâches).
- Le stockage des tâches dans un dictionnaire (objet).
- L'utilisation du pattern `resolve`/`reducers` de `Updater` pour des mises à jour complexes (ajout/suppression).
- L'implémentation de l'historique (undo/redo) avec `Undoable` et les thunks intégrés.
- La séparation de l'état UI et des données métier avec `Slice`.
- L'utilisation de `Resolver` et des `selectors` intégrés pour l'accès aux données.

**Structure des Fichiers :**

```
src/
├── api.ts           # Simulation de l'API externe
├── types.ts         # Définitions de types TypeScript partagées
├── TodoListComponent.tsx # Composant React de présentation (UI)
├── state.ts         # Logique d'état avec scalux (Slices, Updaters, Component...)
├── store.ts         # Configuration du store Redux
├── main.tsx         # Point d'entrée de l'application React
└── index.css        # Styles (optionnel)
```

---

**1. `src/types.ts` - Types Partagés**

Définir des types clairs est essentiel en TypeScript. Nous les centralisons ici.

```typescript
// src/types.ts

/** Type de base pour une tâche Todo */
export type Todo = {
  id: string;
  label: string;
  done: boolean;
};

/** Type pour stocker les todos sous forme de dictionnaire { [id]: Todo } */
export type TodoDict = Record<string, Todo>;

// ---- Props pour le Composant React TodoListComponent ----

/** Props contenant les données à afficher */
export type TodoListComponentDataProps = {
  todos: Todo[]; // Les todos sous forme de tableau pour le rendu
  newItemText: string; // Texte dans le champ d'ajout
  isLoading: boolean; // Indicateur de chargement API
  error: string | null; // Message d'erreur API
  canUndo: boolean; // Vrai si l'action 'undo' est possible
  canRedo: boolean; // Vrai si l'action 'redo' est possible
};

/** Props contenant les fonctions (handlers) à appeler par l'UI */
export type TodoListComponentHandlerProps = {
  fetchTodos: () => void;
  addTodo: (label: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setNewItemText: (text: string) => void;
  undoAction: () => void;
  redoAction: () => void;
};

/** Type complet des props pour le composant TodoListComponent */
export type TodoListComponentProps = TodoListComponentDataProps &
  TodoListComponentHandlerProps;
```

---

**2. `src/api.ts` - Simulation API**

Pour cet exemple, nous simulons une API externe.

```typescript
// src/api.ts

// Type de données tel que retourné par l'API (peut différer de notre état interne)
export type ApiTodo = {
  id: string;
  title: string;
  completed: boolean;
};

/** Simule un appel API pour récupérer les todos initiaux */
export const fetchTodosApi = async (): Promise<ApiTodo[]> => {
  console.log("API: Fetching todos...");
  await new Promise((resolve) => setTimeout(resolve, 800)); // Latence simulée

  if (Math.random() > 0.15) {
    // Simule un succès ou une erreur
    console.log("API: Fetch successful");
    const todos: ApiTodo[] = [
      // Sample data... (données d'exemple comme dans les versions précédentes)
      { id: "1", title: "Apprendre scalux", completed: true },
      {
        id: "2",
        title: "Utiliser Updater avec resolve/reducers",
        completed: false,
      },
      { id: "3", title: "Implémenter undo/redo", completed: false },
      { id: "4", title: "Boire un café", completed: true },
      { id: "5", title: "Tester la suppression", completed: false },
    ];
    return todos;
  } else {
    console.error("API: Fetch failed");
    throw new Error("Erreur réseau simulée lors de la récupération des todos.");
  }
};

/** Simule la création d'un todo côté API */
export const addTodoApi = async (label: string): Promise<{ id: string }> => {
  console.log(`API: Adding todo "${label}"...`);
  await new Promise((resolve) => setTimeout(resolve, 300)); // Latence simulée
  const newId = `temp_${Date.now()}`; // Génère un ID simple pour la démo
  console.log(`API: Todo added with temp ID ${newId}`);
  return { id: newId };
};
```

---

**3. `src/TodoListComponent.tsx` - Composant de Présentation**

C'est un composant React standard, responsable uniquement de l'affichage et de la délégation des interactions aux `handlers` reçus via les `props`.

```tsx
// src/TodoListComponent.tsx
import React, { useEffect } from "react";
import type { TodoListComponentProps } from "./types"; // Importe le type des props

/** Composant React pur pour afficher la liste de Todos */
export const TodoListComponentDisplay: React.FC<TodoListComponentProps> = ({
  // Déstructuration des props pour un accès facile
  todos,
  newItemText,
  isLoading,
  error,
  canUndo,
  canRedo,
  fetchTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  setNewItemText,
  undoAction,
  redoAction,
}) => {
  // Effet pour charger les todos au montage initial du composant
  useEffect(() => {
    fetchTodos();
    // fetchTodos est stable car généré par scalux/Updater, pas besoin de le lister
    // comme dépendance si on utilise les règles d'ESLint pour les hooks,
    // mais l'inclure est plus sûr si on n'est pas certain.
  }, [fetchTodos]);

  /** Gère la soumission du formulaire d'ajout */
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (newItemText.trim()) {
      addTodo(newItemText.trim()); // Appelle le handler fourni en prop
      // Le champ est vidé par le reducer associé à addTodo
    }
  };

  return (
    <div style={{ padding: "0 2.5em" }}>
      <h1>Ma Todo List avec `scalux`</h1>

      {/* Boutons Undo/Redo */}
      <div>
        <button onClick={undoAction} disabled={!canUndo || isLoading}>
          Undo (Précédent)
        </button>
        <button onClick={redoAction} disabled={!canRedo || isLoading}>
          Redo (Suivant)
        </button>
      </div>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleAdd} style={{ margin: "1em 0" }}>
        <input
          type="text"
          placeholder="Nouvelle tâche..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)} // Met à jour l'état via le handler
          disabled={isLoading} // Désactivé pendant le chargement
          aria-label="Nouvelle tâche"
        />
        <button type="submit" disabled={isLoading || !newItemText.trim()}>
          Ajouter
        </button>
      </form>

      {/* Indicateur de chargement */}
      {isLoading && <p>Chargement des todos...</p>}

      {/* Affichage d'erreur */}
      {error && <p style={{ color: "red" }}>Erreur: {error}</p>}

      {/* Liste des todos */}
      {!isLoading && !error && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                /* styles pour la lisibilité */ display: "flex",
                alignItems: "center",
                margin: "0.5em 0",
                textDecoration: todo.done ? "line-through" : "none",
                opacity: todo.done ? 0.6 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)} // Appelle le handler
                style={{ marginRight: "0.5em" }}
                aria-label={`Marquer ${todo.label} comme ${
                  todo.done ? "non fait" : "fait"
                }`}
              />
              <span style={{ flexGrow: 1 }}>{todo.label}</span>
              <button
                onClick={() => deleteTodo(todo.id)} // Appelle le handler
                aria-label={`Supprimer ${todo.label}`}
                style={{ marginLeft: "0.5em" }}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Message si la liste est vide */}
      {!isLoading && !error && todos.length === 0 && (
        <p>Aucune tâche pour le moment !</p>
      )}
    </div>
  );
};
```

---

**4. `src/state.ts` - Logique d'État avec `scalux`**

C'est le cœur de notre application avec `scalux`. On y définit la structure de l'état, les logiques de mise à jour (Updaters), et on connecte le composant React à cet état.

```typescript
// src/state.ts
import { State, Slice, Undoable } from "scalux"; // Imports principaux de scalux
import { fetchTodosApi, addTodoApi } from "./api"; // Notre API simulée
import type { Todo, TodoDict, TodoListComponentDataProps } from "./types"; // Nos types partagés
import { TodoListComponentDisplay } from "./TodoListComponent"; // Notre composant UI

// ---- 1. Définition de la Structure de l'État ----

// On utilise `Slice` pour découper l'état en domaines logiques.
// Slice pour les données métier (todos, texte d'ajout).
// On l'enveloppe dans `Undoable` pour activer l'historique (undo/redo).
const dataSlice = Slice(
  Undoable({
    todos: {} as TodoDict, // Stockage en dictionnaire { id: Todo }
    newItemText: "",
  })
);

// Slice pour l'état de l'UI (chargement, erreurs).
// Pas besoin d'historique ici, donc pas de `Undoable`.
const uiSlice = Slice({
  loading: false,
  error: null as string | null,
});

// ---- 2. Initialisation de `scalux` avec notre État ----
// `State` prend l'état initial (ici, composé de slices) et retourne
// les constructeurs nécessaires (`Component`, `Updater`, etc.).
const {
  Component, // Constructeur pour connecter les composants React
  register, // Fonction pour enregistrer les reducers générés
  Updater, // Constructeur pour définir la logique de mise à jour
  Resolver, // Constructeur pour créer des sélecteurs réutilisables
  selectors, // Ensemble de sélecteurs générés automatiquement
  undo, // Thunk Redux pré-configuré pour l'action "undo"
  redo, // Thunk Redux pré-configuré pour l'action "redo"
} = State({
  // Notre état est composé de deux slices :
  data: dataSlice,
  ui: uiSlice,
});

// ---- 3. Définition des Updaters (Logique de Mise à Jour) ----

// Chaque Updater définit comment une action utilisateur modifie l'état.

/** Met à jour le champ de saisie */
const setNewItemText = Updater((_state, newText: string) => ({
  // Retourne un objet partiel de l'InternalState à mettre à jour.
  // scalux s'occupe de merger cette mise à jour dans l'état.
  // Ici, on cible `state.data.newItemText` (via l'InternalState).
  data: { newItemText: newText },
}));

/** Bascule l'état 'done' d'un todo */
const toggleTodo = Updater((state, todoId: string) => {
  // Le premier argument 'state' représente l'InternalState actuel.
  const currentTodo = selectors.pick.data.todos(state)[todoId];
  if (!currentTodo) return {}; // Ne rien faire si l'ID n'existe pas

  // Met à jour seulement la propriété 'done' du todo concerné.
  return {
    data: {
      // Cible la slice 'data'
      todos: {
        // Cible le dictionnaire 'todos'
        // Clé dynamique pour cibler le bon todo
        [todoId]: { ...currentTodo, done: !currentTodo.done },
      },
    },
  };
});

/** Charge les todos depuis l'API (fonction asynchrone) */
const fetchTodos = Updater(async () => {
  // Les Updaters peuvent être async. scalux gère l'attente.
  try {
    // Dispatch implicite d'un état de chargement (optionnel mais bonne pratique)
    // On retourne directement la mise à jour partielle de l'InternalState.
    // Note: Un Updater async DOIT retourner l'état final à merger.
    // Il ne peut pas retourner plusieurs états intermédiaires directement.
    // Pour cela, il faudrait utiliser un Thunk manuel.
    // Ici, on met l'état loading AVANT l'appel, et on met à jour à la fin.
    // (Alternative: un thunk qui dispatche 'loading', puis 'success'/'error')

    // Appel API (simulé)
    const apiTodos = await fetchTodosApi();

    // Transformation des données API vers notre format interne (dictionnaire)
    const todosDict = apiTodos.reduce((acc, apiTodo) => {
      acc[apiTodo.id] = {
        id: apiTodo.id,
        label: apiTodo.title,
        done: apiTodo.completed,
      };
      return acc;
    }, {} as TodoDict);

    // Retourne la mise à jour finale (données chargées, fin chargement)
    return {
      data: { todos: todosDict }, // Met à jour les todos dans la slice 'data'
      ui: { loading: false, error: null }, // Met à jour la slice 'ui'
    };
  } catch (e: any) {
    // En cas d'erreur API, met à jour la slice 'ui' avec l'erreur
    return {
      ui: { loading: false, error: e.message || "Erreur inconnue" },
    };
  }
  // Note: L'état 'loading: true' doit être géré soit par l'appelant (moins idéal),
  // soit via un thunk manuel, soit en acceptant que l'UI ne montre le loading
  // que pendant la résolution de la promesse de cet Updater.
  // Pour simplifier cet exemple, on ne met pas l'état loading=true ici.
  // Une approche plus robuste utiliserait un thunk ou des actions séparées.
});

/** Ajoute un nouveau Todo (pattern resolve/reducers) */
const addTodo = Updater({
  // 1. 'resolve': Fonction (peut être async) pour pré-traiter la payload.
  // Reçoit (state, payloadDuHandler) et retourne la donnée prête pour les reducers.
  resolve: Resolver(async (_state, label: string) => {
    if (!label.trim()) {
      throw new Error("Le libellé ne peut pas être vide.");
    }
    // Appelle l'API pour créer le todo et/ou obtenir un ID
    const { id } = await addTodoApi(label); // Simulé ici
    const newTodo = { id, label, done: false };
    return newTodo; // Cette valeur sera passée au(x) reducer(s)
  }),
  // 2. 'updates': Objet où les clés sont les noms des slices à modifier.
  // Chaque valeur est une fonction reducer qui reçoit (sliceState, resolvedData).
  // Utilise Immer en coulisses : on peut muter `sliceState` directement.
  updates: {
    data: (dataSliceState, newTodo: Todo) => {
      // `dataSliceState` est un brouillon Immer
      dataSliceState.todos[newTodo.id] = newTodo; // Ajout au dictionnaire
      dataSliceState.newItemText = ""; // Réinitialisation du champ texte
    },
    // On pourrait aussi modifier la slice 'ui' ici si nécessaire
    // ui: (uiSliceState, newTodo) => { /* ... */ }
  },
});

/** Supprime un Todo (pattern resolve/reducers) */
const deleteTodo = Updater({
  // 'resolve' est simple ici: on passe juste l'ID reçu du handler.
  resolve: Resolver((_state, todoId: string) => todoId),
  // 'reducers' est nécessaire car la suppression d'une clé dans un objet
  // est plus facile/propre avec Immer qu'avec un merge partiel.
  updates: {
    data: (dataSliceState, todoIdToRemove: string) => {
      // Mutation directe du brouillon Immer pour supprimer la clé.
      delete dataSliceState.todos[todoIdToRemove];
    },
  },
});

// ---- 4. Connexion du Composant React à l'État `scalux` ----

// Utilisation de `Resolver` pour créer un sélecteur réutilisable et typé.
// Il prend l'état global (RootState) et retourne les DataProps nécessaires à l'UI.
const selectTodoListData = Resolver((state): TodoListComponentDataProps => {
  // Utilisation des `selectors` générés par `scalux` pour un accès simplifié et sûr :
  // - `selectors.pick` accède aux propriétés des slices (gère `.present` si Undoable)
  // - `selectors.rawGrab` accède à l'état brut d'une slice (utile pour `past`, `future`)

  const todosDict = selectors.pick.data.todos(state);
  const newItemText = selectors.pick.data.newItemText(state);
  const isLoading = selectors.pick.ui.loading(state);
  const error = selectors.pick.ui.error(state);

  // Accès à l'état brut de la slice 'data' pour vérifier l'historique
  const dataRawState = selectors.rawGrab.data(state);
  const canUndo = dataRawState.past.length > 0;
  const canRedo = dataRawState.future.length > 0;

  // Transformation du dictionnaire en tableau pour faciliter le map dans React
  const todosArray = Object.values(todosDict);

  return { todos: todosArray, newItemText, isLoading, error, canUndo, canRedo };
});

// Utilisation de `Component` pour créer le composant connecté ("Container")
export const ConnectedTodoList = Component({
  // `domain`: Préfixe unique pour les types d'actions Redux générés (utile pour DevTools)
  domain: "TodoList",
  // `render`: Le composant React de présentation à utiliser
  render: TodoListComponentDisplay,
  // `data`: Le sélecteur qui mappe l'état Redux aux props de données du composant
  data: selectTodoListData,
  // `handlers`: Mappe les props de fonction du composant aux Updaters/Thunks définis plus haut
  handlers: {
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    setNewItemText,
    undoAction: undo, // Utilisation directe du thunk 'undo' fourni par scalux
    redoAction: redo, // Utilisation directe du thunk 'redo' fourni par scalux
  },
});

// ---- 5. Enregistrement Final ----
// `register()` doit être appelé APRÈS la définition de tous les `Component`s.
// Il collecte tous les reducers générés implicitement par les `handlers`
// et retourne le reducer racine pour le store Redux.
const { reducer } = register();

// ---- Exports ----
export { reducer }; // Le reducer racine pour configureStore
// ConnectedTodoList est déjà exporté plus haut pour main.tsx
```

---

**5. `src/store.ts` - Configuration du Store Redux**

Configuration standard du store avec `configureStore` (ré-exporté par `scalux` depuis Redux Toolkit).

```typescript
// src/store.ts
import { configureStore } from "@reduxjs/toolkit"; // Utilise la fonction de Redux Toolkit
import { reducer } from "./state"; // Importe le reducer racine généré par scalux

export const store = configureStore({
  reducer, // Le reducer combiné gérant toutes nos slices et logiques
  // Les middlewares par défaut de Redux Toolkit (thunk, immutability check, etc.)
  // sont inclus automatiquement.
  // L'extension Redux DevTools est également prise en charge.
});

// Types optionnels pour l'inférence dans l'application
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
```

---

**6. `src/main.tsx` - Point d'Entrée de l'Application**

Point d'entrée React classique, utilisant le `Provider` (ré-exporté par `scalux` depuis `react-redux`) pour injecter le store.

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "scalux"; // Le Provider de react-redux
import { store } from "./store"; // Notre store configuré
import { ConnectedTodoList } from "./state"; // Notre composant connecté final
import "./index.css"; // Styles optionnels

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Le Provider rend le store Redux disponible à tous les composants connectés */}
    <Provider store={store}>
      <ConnectedTodoList />
    </Provider>
  </React.StrictMode>
);
```

---

Ce code fournit un exemple fonctionnel et structuré utilisant les fonctionnalités clés de `scalux` pour une application Todo List typique. Il met en évidence la réduction du boilerplate, la gestion de l'état asynchrone, l'historique et l'utilisation des différents outils (`Slice`, `Updater`, `Resolver`, `Component`, `selectors`) proposés par la librairie.
