import { GenerateCode } from './generateCode'
import { TransformCode } from './transformCode'
import { WriteFile } from './writeFile'

new GenerateCode(
  {
    filePath: 'C:/Users/martin-yin/Desktop/webHawkReport/web-dev-tools/code-generate/src',
    domains: [
      {
        module: 'admin',
        repositorys: [
          {
            url: 'http://127.0.0.1:8889/admin/adminLogin',
            method: 'POST',
            body: {
              user_name: 'admin',
              password: '123456'
            }
          },
          {
            url: 'http://127.0.0.1:8889/admin/registerAdmin',
            method: 'POST',
            body: {
              user_name: 'admin1',
              password: '123456',
              nick_name: '123456'
            }
          }
        ]
      }
    ]
  },
  new TransformCode(),
  new WriteFile()
).run()
