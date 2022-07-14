# tool-cabinet-cli 

```typescript
$ pnpm add @martin-yin/tool-cabinet-cli -g

$ tool-cabinet-cli --help

tool-cabinet-cli/0.0.1

Usage:
  $ tool-cabinet-cli <command> [options]

Commands:
  generate-request-code  通过repository生成代码
  tsyringe-inject        生成tsyringe需要注入代码

For more info, run any command with the `--help` flag:
  $ tool-cabinet-cli generate-request-code --help
  $ tool-cabinet-cli tsyringe-inject --help

Options:
  -h, --help           Display this message
  -v, --version        Display version number
  -c, --config <file>  [string] 配置文件地址

```


## generate-request-code 

可自动创建整洁架构所需要的 domain 文件。

配置文件

```typescript
// generate-request-code.config.ts

import { defineConfig } from './src/config'
import { entityTemplate } from './src/plugins/entityTemplate'
import { modelTemplate } from './src/plugins/modelTemplate'

export default {
  requestConfig: {
    baseURL: 'http://192.168.31.116:3000'
  },
  interceptorRequest: null,
  interceptorResponse: response => {
    const responseCode = response.status
    if (responseCode < 300) {
      return Promise.resolve(response.data.data)
    } else {
      return Promise.reject(response)
    }
  },
  baseFilePath: 'D:/knowledge-base/packages/webapp/src/',
  plugins: [entityTemplate, modelTemplate], // 默认是4个模板，在根据传递进来的模板判断差集
  domains: [
    {
      module: 'article',
      repositorys: [
        {
          url: '/article',
          method: 'GET',
          params: {
            title: '',
            keywords: '',
            category: '',
            pageIndex: 1,
            pageSize: 15
          }
        }
      ]
    }
  ]
}

// 使用 `defineGenerateRepositoryCodeConfig`, 有类型提示。
export default defineGenerateRepositoryCodeConfig({
  ....
})
```


## tsyringe-inject

正如其名, 需要配合 tsyringe使用

tsyringe 管理注入非常麻烦，甚至会出现写错的情况。通过 tsyringe-auto-inject 在分析 AST 树之后解析出各模块之间的对应关系, 最终写入文件中，实现"自动注入"。


会根据传递sourceFilePathList地址, 自动获取抽象类,并自动注入到 main.ts中。

如果导出的类有使用as别名，在注入时会优先使用别名。

tips: 请注意在使用as别名时,请不要跟其他的文件导出的别名冲突。

```typescript
export default {
  mainSourcePath: path.join(__dirname, '../__test__/testFile/main.ts'), // 主文件
  ignoreAbstractList: [], // 需要忽略的抽象类
  sourceFilePathList: [path.join(__dirname, '../__test__/testFile/**/*.ts')], // 要被注入的class
  tsConfigFilePath: path.join(__dirname, '../__test__/testFile/tsconfig.json') // tsconfig 位置
}

// 使用 `defineTsyringeInjectConfig`, 有类型提示。
export default defineTsyringeInjectConfig({
  mainSourcePath: path.join(__dirname, '../__test__/testFile/main.ts'), // 主文件
  ignoreAbstractList: [], // 需要忽略的抽象类
  sourceFilePathList: [path.join(__dirname, '../__test__/testFile/**/*.ts')], // 要被注入的class
  tsConfigFilePath: path.join(__dirname, '../__test__/testFile/tsconfig.json') // tsconfig 位置
})

```