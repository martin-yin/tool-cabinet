# generate-request-code

可自动创建`整洁架构`所需要的 domain 文件。

## 使用

```typescript
npx generate-request-code ./config.js
```

传递配置`js`地址即可

## 配置文件格式

```typescript
module.exports = {
  requestConfig: {
    // axios config 配置
    baseURL: 'http://192.168.31.116:3000'
  },
  // axios 拦截器
  interceptorRequest: config => {},
  interceptorResponse: response => {
    const responseCode = response.status
    if (responseCode < 300) {
      return Promise.resolve(response.data.data)
    } else {
      return Promise.reject(response)
    }
  },
  filePath: 'D:/knowledge-base/packages/webapp/src', // 写入代码地址
  domains: [
    {
      module: 'article',
      repositorys: [
        // AxiosRequestConfig
        {
          url: '/article',
          method: 'GET',
          params: {
            title: '文章',
            keywords: '关键字',
            category: '分类'
          }
        }
      ]
    }
  ]
}
```

## Todo

1. 自定义模板功能

2. 根据传递参数，选择性生成文件。

3. 根据传递参数覆盖文件
