import{_ as n,c as s,o as a,a as t}from"./app.e00d5a32.js";const m='{"title":"tool-cabinet-cli","description":"","frontmatter":{"sidebarDepth":2},"headers":[{"level":2,"title":"\u4F7F\u7528","slug":"\u4F7F\u7528"},{"level":2,"title":"tool-cabinet-cli generate-request-code","slug":"tool-cabinet-cli-generate-request-code"},{"level":2,"title":"tool-cabinet-cli tsyringe-inject","slug":"tool-cabinet-cli-tsyringe-inject"}],"relativePath":"index.md","lastUpdated":1657809833000}',p={},o=t(`<h1 id="tool-cabinet-cli" tabindex="-1">tool-cabinet-cli <a class="header-anchor" href="#tool-cabinet-cli" aria-hidden="true">#</a></h1><h2 id="\u4F7F\u7528" tabindex="-1">\u4F7F\u7528 <a class="header-anchor" href="#\u4F7F\u7528" aria-hidden="true">#</a></h2><div class="language-typescript"><pre><code>$ pnpm add <span class="token decorator"><span class="token at operator">@</span><span class="token function">martin</span></span><span class="token operator">-</span>yin<span class="token operator">/</span>tool<span class="token operator">-</span>cabinet<span class="token operator">-</span>cli <span class="token operator">-</span>g

$ tool<span class="token operator">-</span>cabinet<span class="token operator">-</span>cli <span class="token operator">--</span>help

tool<span class="token operator">-</span>cabinet<span class="token operator">-</span>cli<span class="token operator">/</span><span class="token number">0.0</span><span class="token number">.1</span>

Usage<span class="token operator">:</span>
  $ tool<span class="token operator">-</span>cabinet<span class="token operator">-</span>cli <span class="token operator">&lt;</span>command<span class="token operator">&gt;</span> <span class="token punctuation">[</span>options<span class="token punctuation">]</span>

Commands<span class="token operator">:</span>
  generate<span class="token operator">-</span>request<span class="token operator">-</span>code  \u901A\u8FC7repository\u751F\u6210\u4EE3\u7801
  tsyringe<span class="token operator">-</span>inject        \u751F\u6210tsyringe\u9700\u8981\u6CE8\u5165\u4EE3\u7801

For more info<span class="token punctuation">,</span> run <span class="token builtin">any</span> command <span class="token keyword">with</span> the <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">--help</span><span class="token template-punctuation string">\`</span></span> flag<span class="token operator">:</span>
  $ tool<span class="token operator">-</span>cabinet<span class="token operator">-</span>cli generate<span class="token operator">-</span>request<span class="token operator">-</span>code <span class="token operator">--</span>help
  $ tool<span class="token operator">-</span>cabinet<span class="token operator">-</span>cli tsyringe<span class="token operator">-</span>inject <span class="token operator">--</span>help

Options<span class="token operator">:</span>
  <span class="token operator">-</span>h<span class="token punctuation">,</span> <span class="token operator">--</span>help           Display <span class="token keyword">this</span> message
  <span class="token operator">-</span>v<span class="token punctuation">,</span> <span class="token operator">--</span>version        Display version <span class="token builtin">number</span>
  <span class="token operator">-</span>c<span class="token punctuation">,</span> <span class="token operator">--</span>config <span class="token operator">&lt;</span>file<span class="token operator">&gt;</span>  <span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span> \u914D\u7F6E\u6587\u4EF6\u5730\u5740

</code></pre></div><h2 id="tool-cabinet-cli-generate-request-code" tabindex="-1">tool-cabinet-cli generate-request-code <a class="header-anchor" href="#tool-cabinet-cli-generate-request-code" aria-hidden="true">#</a></h2><p>\u53EF\u81EA\u52A8\u521B\u5EFA\u6574\u6D01\u67B6\u6784\u6240\u9700\u8981\u7684 domain \u6587\u4EF6\u3002</p><p>\u914D\u7F6E\u6587\u4EF6</p><div class="language-typescript"><pre><code><span class="token comment">// generate-request-code.config.ts</span>

<span class="token keyword">import</span> <span class="token punctuation">{</span> defineConfig <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;./src/config&#39;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> entityTemplate <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;./src/plugins/entityTemplate&#39;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> modelTemplate <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;./src/plugins/modelTemplate&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
  requestConfig<span class="token operator">:</span> <span class="token punctuation">{</span>
    baseURL<span class="token operator">:</span> <span class="token string">&#39;http://192.168.31.116:3000&#39;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  interceptorRequest<span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  <span class="token function-variable function">interceptorResponse</span><span class="token operator">:</span> response <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> responseCode <span class="token operator">=</span> response<span class="token punctuation">.</span>status
    <span class="token keyword">if</span> <span class="token punctuation">(</span>responseCode <span class="token operator">&lt;</span> <span class="token number">300</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token builtin">Promise</span><span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span>response<span class="token punctuation">.</span>data<span class="token punctuation">.</span>data<span class="token punctuation">)</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token builtin">Promise</span><span class="token punctuation">.</span><span class="token function">reject</span><span class="token punctuation">(</span>response<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  baseFilePath<span class="token operator">:</span> <span class="token string">&#39;D:/knowledge-base/packages/webapp/src/&#39;</span><span class="token punctuation">,</span>
  plugins<span class="token operator">:</span> <span class="token punctuation">[</span>entityTemplate<span class="token punctuation">,</span> modelTemplate<span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token comment">// \u9ED8\u8BA4\u662F4\u4E2A\u6A21\u677F\uFF0C\u5728\u6839\u636E\u4F20\u9012\u8FDB\u6765\u7684\u6A21\u677F\u5224\u65AD\u5DEE\u96C6</span>
  domains<span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
      module<span class="token operator">:</span> <span class="token string">&#39;article&#39;</span><span class="token punctuation">,</span>
      repositorys<span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span>
          url<span class="token operator">:</span> <span class="token string">&#39;/article&#39;</span><span class="token punctuation">,</span>
          method<span class="token operator">:</span> <span class="token string">&#39;GET&#39;</span><span class="token punctuation">,</span>
          params<span class="token operator">:</span> <span class="token punctuation">{</span>
            title<span class="token operator">:</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">,</span>
            keywords<span class="token operator">:</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">,</span>
            category<span class="token operator">:</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">,</span>
            pageIndex<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
            pageSize<span class="token operator">:</span> <span class="token number">15</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span>

<span class="token comment">// \u4F7F\u7528 \`defineGenerateRepositoryCodeConfig\`, \u6709\u7C7B\u578B\u63D0\u793A\u3002</span>
<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token function">defineGenerateRepositoryCodeConfig</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token operator">...</span><span class="token punctuation">.</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre></div><h2 id="tool-cabinet-cli-tsyringe-inject" tabindex="-1">tool-cabinet-cli tsyringe-inject <a class="header-anchor" href="#tool-cabinet-cli-tsyringe-inject" aria-hidden="true">#</a></h2><p>\u6B63\u5982\u5176\u540D, \u9700\u8981\u914D\u5408 tsyringe\u4F7F\u7528</p><p>tsyringe \u7BA1\u7406\u6CE8\u5165\u975E\u5E38\u9EBB\u70E6\uFF0C\u751A\u81F3\u4F1A\u51FA\u73B0\u5199\u9519\u7684\u60C5\u51B5\u3002\u901A\u8FC7 tsyringe-auto-inject \u5728\u5206\u6790 AST \u6811\u4E4B\u540E\u89E3\u6790\u51FA\u5404\u6A21\u5757\u4E4B\u95F4\u7684\u5BF9\u5E94\u5173\u7CFB, \u6700\u7EC8\u5199\u5165\u6587\u4EF6\u4E2D\uFF0C\u5B9E\u73B0&quot;\u81EA\u52A8\u6CE8\u5165&quot;\u3002</p><p>\u4F1A\u6839\u636E\u4F20\u9012sourceFilePathList\u5730\u5740, \u81EA\u52A8\u83B7\u53D6\u62BD\u8C61\u7C7B,\u5E76\u81EA\u52A8\u6CE8\u5165\u5230 main.ts\u4E2D\u3002</p><p>\u5982\u679C\u5BFC\u51FA\u7684\u7C7B\u6709\u4F7F\u7528as\u522B\u540D\uFF0C\u5728\u6CE8\u5165\u65F6\u4F1A\u4F18\u5148\u4F7F\u7528\u522B\u540D\u3002</p><p>tips: \u8BF7\u6CE8\u610F\u5728\u4F7F\u7528as\u522B\u540D\u65F6,\u8BF7\u4E0D\u8981\u8DDF\u5176\u4ED6\u7684\u6587\u4EF6\u5BFC\u51FA\u7684\u522B\u540D\u51B2\u7A81\u3002</p><div class="language-typescript"><pre><code><span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
  mainSourcePath<span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">&#39;../__test__/testFile/main.ts&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// \u4E3B\u6587\u4EF6</span>
  ignoreAbstractList<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token comment">// \u9700\u8981\u5FFD\u7565\u7684\u62BD\u8C61\u7C7B</span>
  sourceFilePathList<span class="token operator">:</span> <span class="token punctuation">[</span>path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">&#39;../__test__/testFile/**/*.ts&#39;</span><span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token comment">// \u8981\u88AB\u6CE8\u5165\u7684class</span>
  <span class="token class-name">tsConfigFilePath</span><span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">&#39;../__test__/testFile/tsconfig.json&#39;</span><span class="token punctuation">)</span> <span class="token comment">// tsconfig \u4F4D\u7F6E</span>
<span class="token punctuation">}</span>

<span class="token comment">// \u4F7F\u7528 \`defineGenerateRepositoryCodeConfig\`, \u6709\u7C7B\u578B\u63D0\u793A\u3002</span>
<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token function">defineTsyringeInjectConfig</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  mainSourcePath<span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">&#39;../__test__/testFile/main.ts&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// \u4E3B\u6587\u4EF6</span>
  ignoreAbstractList<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token comment">// \u9700\u8981\u5FFD\u7565\u7684\u62BD\u8C61\u7C7B</span>
  sourceFilePathList<span class="token operator">:</span> <span class="token punctuation">[</span>path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">&#39;../__test__/testFile/**/*.ts&#39;</span><span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token comment">// \u8981\u88AB\u6CE8\u5165\u7684class</span>
  <span class="token class-name">tsConfigFilePath</span><span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">&#39;../__test__/testFile/tsconfig.json&#39;</span><span class="token punctuation">)</span> <span class="token comment">// tsconfig \u4F4D\u7F6E</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>

</code></pre></div>`,14),e=[o];function c(l,i,r,u,k,d){return a(),s("div",null,e)}var _=n(p,[["render",c]]);export{m as __pageData,_ as default};
