## tsyringe-auto-inject

正如其名, 需要配合 `tsyringe`使用

`tsyringe` 管理注入非常麻烦，甚至会出现写错的情况。通过 `tsyringe-auto-inject` 在分析 AST 树之后解析出各模块之间的对应关系, 最终写入文件中，实现"自动注入"。

### 使用

会根据传递`sourceFilePathList`地址, 自动获取抽象类,并自动注入到 `main.ts`中。

如果导出的类有使用`as`别名，在注入时会优先使用别名。

tips: 请注意在使用`as`别名时,请不要跟其他的文件导出的别名冲突。

```typescript
new TsyringeAutoInject({
  mainSourcePath: path.join(__dirname, '../__test__/testFile/main.ts'), // 主文件
  ignoreAbstractList: [], // 需要忽略的抽象类
  sourceFilePathList: [path.join(__dirname, '../__test__/testFile/**/*.ts')], // 要被注入的class
  tsConfigFilePath: path.join(__dirname, '../__test__/testFile/tsconfig.json') // tsconfig 位置
}).inject()
```

结果如下:

```typescript
// main.ts
import { container } from 'tsyringe'
import { AA, BB, CC } from './index'

//------ inject start ------
container.register('ArticleRepository', {
  useClass: AA
})
container.register('ArticleRepository', {
  useClass: BB
})
container.register('ArticleRepository', {
  useClass: CC
})
//------ inject end ------
```
