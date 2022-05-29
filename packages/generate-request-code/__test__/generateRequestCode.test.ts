import { GenerateRequestCode } from 'src/generateRequestCode'
import { GenerateRequestCodeOptionsType } from 'src/interface'

describe('generateRequestCode.ts', () => {
  const defaultOption: GenerateRequestCodeOptionsType = {
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
  test('test default template', () => {
    const generateRequestCode = new GenerateRequestCode(defaultOption)
    expect(generateRequestCode.options.plugins.length).toBe(4)
  })

  test('test generate code', async () => {
    const generateRequestCode = new GenerateRequestCode(defaultOption)
    await generateRequestCode.run()
  })
})
