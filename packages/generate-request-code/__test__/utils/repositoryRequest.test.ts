import { RequestRepository } from 'src/requestRepository'

describe('RequestRepository.test', () => {
  test('requestConfig with empty object ', async () => {
    const service = new RequestRepository({
      requestConfig: null
    })
    const result = await service.request({
      url: 'http://127.0.0.1:3000/dictionary/10'
    })
    expect(result.data.code).toBe(0)
  })

  test('requestAfter with function', async () => {
    const service = new RequestRepository({
      requestConfig: {
        baseURL: 'http://127.0.0.1:3000',
        timeout: 60000
      },
      interceptorRequest: null,
      interceptorResponse: (response: any) => {
        const responseCode = response.status
        if (responseCode === 200) {
          return Promise.resolve(response.data.data)
        } else {
          return Promise.reject(response)
        }
      }
    })
    const result: any = await service.request({
      url: '/dictionary/10'
    })
    expect(result.id).toBe(10)
  })
})
