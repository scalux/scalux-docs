import{_ as n,c as a,o as e,ae as t}from"./chunks/framework.iBmvQ__U.js";const u=JSON.parse('{"title":"Architecture","description":"","frontmatter":{},"headers":[],"relativePath":"scalux/en/architecture.md","filePath":"scalux/en/architecture.md"}'),i={name:"scalux/en/architecture.md"};function o(l,s,p,c,r,d){return e(),a("div",null,s[0]||(s[0]=[t(`<h1 id="architecture" tabindex="-1">Architecture <a class="header-anchor" href="#architecture" aria-label="Permalink to &quot;Architecture&quot;">​</a></h1><p><code>scalux</code> is a library that is independent of your file architecture.</p><p>No file segmentation is enforced, but it is recommended to adopt a clear and scalable approach: <strong>start small, grow naturally, stay consistent.</strong></p><h2 id="principles" tabindex="-1">Principles <a class="header-anchor" href="#principles" aria-label="Permalink to &quot;Principles&quot;">​</a></h2><ol><li><strong>Initial minimalism</strong> : always start with the simplest possible solution.</li><li><strong>Natural scalability</strong> : add complexity only when the need arises.</li><li><strong>Consistency and modularity</strong> : each file must have a clearly defined responsibility.</li></ol><p>For a very small project or rapid prototyping, for example:</p><ul><li><strong>A single state file</strong> : one file to define your initial state, connect your components, and create the store.</li><li><strong>No slices, no machines</strong> : keep it minimal.</li></ul><p>Will do the job:</p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki dark-plus vp-code" tabindex="0"><code><span class="line"><span style="color:#9CDCFE;">src</span><span style="color:#D4D4D4;">/</span></span>
<span class="line"><span style="color:#D4D4D4;">├── </span><span style="color:#9CDCFE;">app</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">tsx</span></span>
<span class="line"><span style="color:#D4D4D4;">└── </span><span style="color:#9CDCFE;">main</span><span style="color:#D4D4D4;">.</span><span style="color:#9CDCFE;">tsx</span></span></code></pre></div><h2 id="reference-architecture" tabindex="-1">Reference architecture <a class="header-anchor" href="#reference-architecture" aria-label="Permalink to &quot;Reference architecture&quot;">​</a></h2><p>As your application grows, you can progressively adopt a more modular organisation. The following reference structure is often effective:</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki dark-plus vp-code" tabindex="0"><code><span class="line"><span>src/</span></span>
<span class="line"><span>├── app/</span></span>
<span class="line"><span>│   ├── assets/               # Static resources (icons, wording, etc.)</span></span>
<span class="line"><span>│   │   ├── icons/</span></span>
<span class="line"><span>│   │   ├── wording/</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── components/           # Connected React components</span></span>
<span class="line"><span>│   │   ├── ExampleComponent1/</span></span>
<span class="line"><span>│   │   │   ├── data.ts</span></span>
<span class="line"><span>│   │   │   ├── handlers.ts</span></span>
<span class="line"><span>│   │   │   ├── render.ts</span></span>
<span class="line"><span>│   │   │   └── index.ts</span></span>
<span class="line"><span>│   │   ├── ExampleComponent2.ts</span></span>
<span class="line"><span>│   │   ├── ...</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── display/              # Presentational UI components</span></span>
<span class="line"><span>│   │   ├── buttons/</span></span>
<span class="line"><span>│   │   ├── inputs/</span></span>
<span class="line"><span>│   │   ├── selectors/</span></span>
<span class="line"><span>│   │   ├── texts/</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── logic/                # Reusable business logic</span></span>
<span class="line"><span>│   │   ├── feature1/</span></span>
<span class="line"><span>│   │   ├── ...</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── machines/             # Automata / state-machine logic</span></span>
<span class="line"><span>│   │   ├── ...</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── slices/               # Redux slices (modular global state)</span></span>
<span class="line"><span>│   │   ├── ...</span></span>
<span class="line"><span>│   │   └── index.ts</span></span>
<span class="line"><span>│   ├── state.ts              # Shape of the global state</span></span>
<span class="line"><span>│   ├── store/                # Redux store configuration</span></span>
<span class="line"><span>│   │   ├── index.ts</span></span>
<span class="line"><span>│   │   └── middlewares.ts</span></span>
<span class="line"><span>│   └── main.tsx              # Application entry point</span></span>
<span class="line"><span>├── libs/                     # Reusable functions and utilities</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>└── ...                       # Other files or configurations</span></span></code></pre></div><h3 id="notes-on-this-architecture" tabindex="-1">Notes on this architecture <a class="header-anchor" href="#notes-on-this-architecture" aria-label="Permalink to &quot;Notes on this architecture&quot;">​</a></h3><ul><li><p><strong>Connected components (<code>app/components</code>)</strong><br> Each component folder groups <code>data.ts</code>, <code>handlers.ts</code>, and <code>render.ts</code> to centralise business logic (handlers, selectors) and the display code specific to the component. You can merge everything into a single file if it remains lightweight.</p></li><li><p><strong>Presentational components (<code>app/display</code>)</strong><br> These components are purely “UI”, with no business logic. They can be reused anywhere and do not need to be connected to the global state.</p></li><li><p><strong>State partitioning (<code>app/slices</code>)</strong><br> Put advanced Redux-Toolkit features (Slices, Undoable, etc.) here.</p></li><li><p><strong>State machines (<code>app/machines</code>)</strong><br> For complex state logic (games, multi-step modals, workflows, …), <code>scalux</code> offers structured state-machine management. Keep them at the same level as the slices to clearly distinguish automaton logic from standard Redux data.</p></li><li><p><strong>Static resources (<code>app/assets</code>)</strong><br> Wording, icons and other static files are centralised here, ready to be hooked up with <code>scalux</code> utilities if needed (multilingual handling, icon themes, …).</p></li><li><p><strong><code>state.ts</code> and <code>store/</code></strong><br><code>state.ts</code> describes the shape of the global state (via State, Slices, etc.). The <code>store/</code> folder contains everything related to configuring the Redux store (middlewares, enhancers, etc.).</p></li><li><p><strong>Externalising business logic in <code>logic/</code> for large applications</strong></p></li><li><p><strong><code>libs/</code></strong><br> If you have utility functions that do not directly relate to Redux logic or a React component, group them in <code>libs/</code>. This is the ideal place for code that could potentially be shared with other projects.</p></li></ul><p>This architecture is designed to evolve naturally as your application grows, while remaining easy to maintain.</p>`,15)]))}const g=n(i,[["render",o]]);export{u as __pageData,g as default};
