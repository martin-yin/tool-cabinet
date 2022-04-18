1. 初始化

```ts
const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
});
const sourceFileList = project.addSourceFilesAtPaths(["src/**/*.ts"]);
const mainSource = project.addSourceFileAtPath("main.ts");
const mainSourceFile = mainSource.getSourceFile();
```

2. 循环 `sourceFileList`,并找出 抽象类`class`

```ts
const abstractClassList: Array<ClassDeclaration> = [];
let sourceFileTime: SourceFile = null;
for (const sourceFile of sourceFileList) {
  // 获取当前文件下所有的class
  const classesList = sourceFile.getClasses();
  for (const classes of classesList) {
    // 判断这个class是否是抽象类
    if (isAbstract(classes)) {
      abstractClassList.push(classes);
      sourceFileTime = sourceFile;
    }
  }
}
```

3. 循环抽象类，先找到抽象类的名字，然后再通过这个名字找到

## 俩问题:

1. 忽略某个 抽象类

1. 同一个文件里 实现了继承会出现问题.
