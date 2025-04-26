import{_ as e,c as a,o as n,ae as t}from"./chunks/framework.iBmvQ__U.js";const m=JSON.parse('{"title":"Architecture","description":"","frontmatter":{},"headers":[],"relativePath":"fr/architecture.md","filePath":"fr/architecture.md"}'),p={name:"fr/architecture.md"};function i(l,s,r,o,c,u){return n(),a("div",null,s[0]||(s[0]=[t(`<h1 id="architecture" tabindex="-1">Architecture <a class="header-anchor" href="#architecture" aria-label="Permalink to &quot;Architecture&quot;">​</a></h1><p><code>scalux</code> est une bibliothèque indépendante de votre architecture de fichier.</p><p>Aucun découpage de fichiers n’est imposé, mais il est recommandé d’adopter une approche claire et évolutive : <strong>commencer petit, grandir naturellement, rester cohérent.</strong></p><h2 id="principes" tabindex="-1">Principes <a class="header-anchor" href="#principes" aria-label="Permalink to &quot;Principes&quot;">​</a></h2><ol><li><strong>Minimalisme initial</strong> : commencez toujours par la solution la plus simple possible.</li><li><strong>Évolutivité naturelle</strong> : ajoutez de la complexité uniquement lorsque le besoin se fait ressentir.</li><li><strong>Cohérence et modularité</strong> : chaque fichier doit avoir une responsabilité clairement définie.</li></ol><p>Par exemple pour un tout petit projet ou du prototypage rapide :</p><ul><li><strong>Un seul fichier d’état</strong> : un fichier unique pour définir votre état initial, les composants connectés, et le store.</li><li><strong>Pas de slices, pas de machines</strong> : gardez-le minimal.</li></ul><p>Fera l&#39;affaire :</p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki dark-plus vp-code" tabindex="0"><code><span class="line"><span style="color:#9CDCFE;">src</span><span style="color:#D4D4D4;">/</span></span>
<span class="line"><span style="color:#D4D4D4;">├── </span><span style="color:#9CDCFE;">app</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">tsx</span></span>
<span class="line"><span style="color:#D4D4D4;">└── </span><span style="color:#9CDCFE;">main</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">tsx</span></span></code></pre></div><h2 id="architecture-de-reference" tabindex="-1">Architecture de référence <a class="header-anchor" href="#architecture-de-reference" aria-label="Permalink to &quot;Architecture de référence&quot;">​</a></h2><p>Lorsque votre application prend de l’ampleur, vous pouvez progressivement adopter une organisation plus modulaire. Voici une structure de référence souvent efficace :</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki dark-plus vp-code" tabindex="0"><code><span class="line"><span>src/</span></span>
<span class="line"><span>├── app/</span></span>
<span class="line"><span>│   ├── assets/               # Ressources statiques (icônes, wording, etc.)</span></span>
<span class="line"><span>│   │   ├── icons/</span></span>
<span class="line"><span>│   │   ├── wording/</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── components/           # Composants React connectés</span></span>
<span class="line"><span>│   │   ├── ExampleComponent1/</span></span>
<span class="line"><span>│   │   │   ├── data.ts</span></span>
<span class="line"><span>│   │   │   ├── handlers.ts</span></span>
<span class="line"><span>│   │   │   ├── render.ts</span></span>
<span class="line"><span>│   │   │   └── index.ts</span></span>
<span class="line"><span>│   │   ├── ExampleComponent2.ts</span></span>
<span class="line"><span>│   │   ├── ...</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── display/              # Composants UI de présentation</span></span>
<span class="line"><span>│   │   ├── buttons/</span></span>
<span class="line"><span>│   │   ├── inputs/</span></span>
<span class="line"><span>│   │   ├── selectors/</span></span>
<span class="line"><span>│   │   ├── texts/</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── logic/                # Logique métier réutilisable</span></span>
<span class="line"><span>│   │   ├── feature1/</span></span>
<span class="line"><span>│   │   ├── ...</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── machines/             # Logique d’automates / state machines</span></span>
<span class="line"><span>│   │   ├── ...</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── slices/               # Redux slices (état global modulaire)</span></span>
<span class="line"><span>│   │   ├── ...</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── state.ts              # Structure de l’état global</span></span>
<span class="line"><span>│   ├── store/                # Configuration du store Redux</span></span>
<span class="line"><span>│   │   ├── index.ts</span></span>
<span class="line"><span>│   │   └── middlewares.ts</span></span>
<span class="line"><span>│   └── main.tsx              # Point d’entrée de l’application</span></span>
<span class="line"><span>├── libs/                     # Fonctions et outils réutilisables</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>└── ...                       # Autres fichiers ou configurations</span></span></code></pre></div><h3 id="notes-sur-cette-architecture" tabindex="-1">Notes sur cette architecture <a class="header-anchor" href="#notes-sur-cette-architecture" aria-label="Permalink to &quot;Notes sur cette architecture&quot;">​</a></h3><ul><li><p>Composants connectés (app/components) Chaque dossier de composant regroupe data.ts, handlers.ts, et render.ts pour centraliser la logique métier (handlers, sélecteurs) et la partie affichage propre au composant. Vous pouvez tout rassembler dans un unique fichier si cela reste léger.</p></li><li><p>Composants d’affichage (app/display) Ces composants sont purement « UI », sans logique métier. Ils peuvent être réutilisés partout et n’ont pas besoin d’être connectés à l’état global.</p></li><li><p>Découpage de l’état (app/slices) Placez dans slices les fonctionnalités Redux-Toolkit plus avancées (Slices, Undoable, etc.).</p></li><li><p>Automates (app/machines) Pour la logique d’état complexe (jeu, modales multi-étapes, workflows…), <code>scalux</code> propose une gestion structurée des machines à états. Conservez-les au même niveau que les slices, pour clairement distinguer la logique d’automate des données Redux standard.</p></li><li><p>Ressources statiques (app/assets) Wording, icônes et autres fichiers statiques sont centralisés ici, prêts à être branchés avec les utilitaires <code>scalux</code> si besoin (gestion du multilingue, thèmes d’icônes…).</p></li><li><p>state.ts et store/ state.ts pour décrire la forme de l’état global (via State, Slices, etc.). Le dossier store/ accueille tout ce qui concerne la configuration du store Redux (middlewares, enhancers, etc.).</p></li><li><p>Externalisation du métier dans logic pour les application de grande taille</p></li><li><p>libs/ Si vous avez des fonctions utilitaires qui ne relèvent pas directement d’une logique Redux ou d’un composant React, regroupez-les dans libs/. C’est l’espace idéal pour ce qui peut être potentiellement partagé avec d’autres projets.</p><p>Cette architecture est conçue pour évoluer naturellement à mesure que votre application grandit, tout en restant facile à maintenir.</p></li></ul>`,14)]))}const h=e(p,[["render",i]]);export{m as __pageData,h as default};
