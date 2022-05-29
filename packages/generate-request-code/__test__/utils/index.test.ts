import { getTemplate } from 'src/utils/template'
import { getFuncName, getNames, getUrlLast, toUpperCaseBySymbol, convertType } from '../../src/utils'

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

  test('Test getFuncName', () => {
    const funcName = getFuncName('GET', 'Admin', 'video')
    expect(funcName).toBe('getAdminVideo')
  })

  test('Test getUrlLast', () => {
    const last = getUrlLast(url)
    expect(last).toBe('video')
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
    const result = convertType(JSON.stringify(data), 'VideoEntity')
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
