import {
  getFuncName,
  getUrlLast,
  repositoryRequest,
  toUpperCaseBySymbol,
  getNames,
  transformType,
  getTemplate
} from '../../src/utils'

// jest.mock('colors', () => ({
//   green: jest.fn(),
//   blue: jest.fn(),
//   red: jest.fn()
// }))

describe('index.test.ts', () => {
  const url = 'https://www.fastmock.site/mock/41fa03b4c7422029e00ec4ee0c8063d2/eno-component/api/video'
  test('Test toUpperCaseBySymbol', () => {
    const result = toUpperCaseBySymbol('user-login')
    expect(result).toBe('UserLogin')
  })

  test('Test getNames', () => {
    const names = getNames('user', {
      url: url,
      method: 'GET'
    })
    expect(names).toEqual({
      method: 'get',
      entityType: 'GetUserEntity',
      paramsType: 'GetUserVideoParams',
      modelName: 'GetUserModel',
      funcName: 'getUserVideo'
    })
  })

  test('Test getNames by url number', () => {
    const names = getNames('user', {
      url: 'http://127.0.0.1/article/10',
      method: 'GET'
    })
    console.log(names, '========')
    // expect(names).toEqual({
    //   method: 'get',
    //   entityType: 'GetUserEntity',
    //   paramsType: 'GetUserVideoParams',
    //   modelName: 'GetUserModel',
    //   funcName: 'getUserVideo'
    // })
  })

  test('Test getFuncName', () => {
    const funcName = getFuncName('GET', 'Admin', 'video')
    expect(funcName).toBe('getAdminVideo')
  })

  test('Test getUrlLast', () => {
    const last = getUrlLast(url)
    expect(last).toBe('video')
  })

  describe('Test repositoryRequest', () => {
    test('not found request url', async () => {
      const result = await repositoryRequest({
        url: 'http://www.bccc.cccco',
        method: 'GET'
      })
      expect(result).toBeNull()
    })
    test('connect fail', async () => {
      const result = await repositoryRequest({
        url: 'http://127.0.0.1:8889/admin/adminLogin',
        method: 'POST'
      })
      expect(result).toBeNull()
    })

    test('request success', async () => {
      const result = await repositoryRequest({
        url: 'https://www.fastmock.site/mock/41fa03b4c7422029e00ec4ee0c8063d2/eno-component/api/video',
        method: 'GET',
        params: {
          page: 2
        }
      })
      expect(result.category).toEqual(['全部', '其他', '软文推广', '订单相关', '数据上报相关', '商品相关'])
    })
  })

  test('Test transformType', () => {
    const data = {
      list: {
        fileName: 'Carol Rodriguez',
        previewUrl: 'http://dummyimage.com/200x200/50B347/FFF&text=FastMock',
        filePath: 'filePath',
        domain: 'http://dummyimage.com',
        id: '340000200605204810'
      },
      category: ['全部', '其他', '软文推广', '订单相关', '数据上报相关', '商品相关'],
      total: 30,
      page: 2
    }
    const result = transformType(JSON.stringify(data), 'VideoEntity')
    expect(result).toEqual(
      `export interface List {\n\tfileName: string;\n\tpreviewUrl: string;\n\tfilePath: string;\n\tdomain: string;\n\tid: string;\n}\n\nexport interface VideoEntity {\n\tlist: List;\n\tcategory: string[];\n\ttotal: number;\n\tpage: number;\n}`
    )
  })

  describe('Test getTemplate', () => {
    test('not found template', () => {
      const template = getTemplate['not']
      expect(template).toBeNull()
    })
  })
})
