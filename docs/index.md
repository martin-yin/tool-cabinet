---
sidebarDepth: 2
---

# Web Dev Tools

开发前端时沉淀的一些工具

## code-generate

此工具只适用于采用了"整洁架构"模式的项目。

通过配置文件, `code-eenerate` 会自动请求接口，当接口请求成功时,通过调用`json2ts`将接口返回的数据转换成 `typescript` 类型。

转换成功后, 调用默认模板生成对应的文件。

[code-generate](https://github.com/martin-yin/web-dev-tools/tree/main/packages/code-generate)

## tsyringe-auto-inject

正如其名, 需要配合 `tsyringe`使用

`tsyringe` 管理注入非常麻烦，甚至会出现写错的情况。通过 `tsyringe-auto-inject` 在分析 AST 树之后解析出各模块之间的对应关系，最总写入顶部文件中，实现"自动注入"。

[code-generate](https://github.com/martin-yin/web-dev-tools/tree/main/packages/tsyringe-auto-inject)
