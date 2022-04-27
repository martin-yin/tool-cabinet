import { GenerateCode } from './generateCode'

new GenerateCode({
  filePath: 'C:/Users/martin-yin/Desktop/webHawkReport/web-dev-tools/code-generate/src',
  domains: [
    {
      module: 'video',
      repositorys: [
        {
          url: 'https://www.fastmock.site/mock/41fa03b4c7422029e00ec4ee0c8063d2/eno-component/api/video',
          method: 'GET',
          params: {
            page: 2
          }
        }
      ]
    }
  ]
}).run()
