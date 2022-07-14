# rollup-elvin-upload

打包时用于上传`source map`,仅支持`vite`环境

### 使用 
```typescript
export default defineConfig({
  plugins: [
    elvinUpload({
      include: "./dist",
      token: "",
      uploadUrl: "http://127.0.0.1:3100/upload",
      ignoreFile: "./gitignore",
    }),
  ],
  build: {
    sourcemap: true,  // 需要开启surce map, 否则则获取不到source map
  },
});
```