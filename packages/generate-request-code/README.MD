# generate-request-code

可自动创建`整洁架构`所需要的 domain 文件。

## 使用

```typescript
npx generate-request-code ./generate-request-code.config.ts
```

传递配置`js`地址即可

## 配置文件格式

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

// 使用 `defineConfig`,可以对类型做提示。
export default defineConfig({
  ....
})
```
