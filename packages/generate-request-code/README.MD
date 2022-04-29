# generate-request-code

可自动创建`整洁架构`所需要的 domain 文件。

## 使用

```typescript
npx generate-request-code ./config.json
```

传递配置文件 json 地址即可

### 配置文件格式

```typescript

 {
    "filePath": "C:/Users/martin-yin/Desktop/webHawkReport/web-dev-tools/code-generate/src",
    "domains": [
      {
        "module": "video",
        "repositorys": [
          {
            "url": "https://www.fastmock.site/api/video",
            "method": "GET",
            "params": {
              "page": 2
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
