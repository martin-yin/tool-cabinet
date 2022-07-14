import{_ as n,c as a,o as s,b as t}from"./app.ba698385.js";const h='{"title":"rollup-elvin-upload","description":"","frontmatter":{},"headers":[{"level":3,"title":"\u4F7F\u7528","slug":"\u4F7F\u7528"}],"relativePath":"rollup-elvin-upload.md","lastUpdated":1657818955000}',p={},o=t(`<h1 id="rollup-elvin-upload" tabindex="-1">rollup-elvin-upload <a class="header-anchor" href="#rollup-elvin-upload" aria-hidden="true">#</a></h1><p>\u6253\u5305\u65F6\u7528\u4E8E\u4E0A\u4F20<code>source map</code>,\u4EC5\u652F\u6301<code>vite</code>\u73AF\u5883</p><h3 id="\u4F7F\u7528" tabindex="-1">\u4F7F\u7528 <a class="header-anchor" href="#\u4F7F\u7528" aria-hidden="true">#</a></h3><div class="language-typescript"><pre><code><span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token function">defineConfig</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  plugins<span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token function">elvinUpload</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      include<span class="token operator">:</span> <span class="token string">&quot;./dist&quot;</span><span class="token punctuation">,</span>
      token<span class="token operator">:</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">,</span>
      uploadUrl<span class="token operator">:</span> <span class="token string">&quot;http://127.0.0.1:3100/upload&quot;</span><span class="token punctuation">,</span>
      ignoreFile<span class="token operator">:</span> <span class="token string">&quot;./gitignore&quot;</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  build<span class="token operator">:</span> <span class="token punctuation">{</span>
    sourcemap<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>  <span class="token comment">// \u9700\u8981\u5F00\u542Fsurce map, \u5426\u5219\u5219\u83B7\u53D6\u4E0D\u5230source map</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div>`,4),e=[o];function c(l,u,i,r,d,k){return s(),a("div",null,e)}var f=n(p,[["render",c]]);export{h as __pageData,f as default};
