import { RepositoryRequest } from '../../src/utils/request'

describe('repositoryRequest.test', () => {
  test('requestConfig with empty object ', async () => {
    RepositoryRequest.initService(null)
    const result = await RepositoryRequest.request({
      url: 'http://127.0.0.1:3000/dictionary/10'
    })
    expect(result.data.code).toBe(0)
  })

  test('requestAfter with function', async () => {
    RepositoryRequest.initService(
      {
        baseURL: 'http://127.0.0.1:3000',
        timeout: 60000
      },
      null,
      (response: any) => {
        const responseCode = response.status
        if (responseCode === 200) {
          return Promise.resolve(response.data.data)
        } else {
          return Promise.reject(response)
        }
      }
    )
    const result: any = await RepositoryRequest.request({
      url: '/dictionary/10'
    })
    expect(result.id).toBe(10)
  })
})
