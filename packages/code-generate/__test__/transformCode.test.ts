import { DomainType, RepositoryType } from '../src/interface'
import { RepositoryCodeParams, TransformCode } from '../src/transformCode'

jest.useFakeTimers()
const chalk = require('chalk')

jest.mock('chalk', () => ({
  green: jest.fn(),
  blue: jest.fn(),
  red: jest.fn()
}))

describe('transformCode.test.ts', () => {
  let transformCode = new TransformCode()
  transformCode._module = 'Video'

  afterEach(() => {
    transformCode.initSourceCode()
  })
  describe('Test TransformCode', () => {
    test('transformEntityCode', () => {
      const result = {
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
      transformCode.transformEntityCode(result, 'VideoEntity', 'GetVideo', 'GetVideoParams')

      const entityCode = transformCode._entityCode
      expect(entityCode.entityTypeContent).toEqual([
        'export interface List {\n' +
          '\tfileName: string;\n' +
          '\tpreviewUrl: string;\n' +
          '\tfilePath: string;\n' +
          '\tdomain: string;\n' +
          '\tid: string;\n' +
          '}\n' +
          '\n' +
          'export interface VideoEntity {\n' +
          '\tlist: List;\n' +
          '\tcategory: string[];\n' +
          '\ttotal: number;\n' +
          '\tpage: number;\n' +
          '}'
      ])
      expect(entityCode.abstractClassList.abstractClassName).toBe('videoRepository')
      expect(transformCode._entityCode.abstractClassList.abstractFuncList).toEqual([
        { funcName: 'GetVideo', paramsType: 'GetVideoParams', returnType: 'VideoEntity' }
      ])
    })

    test('transformModelCode', () => {
      const repository: RepositoryType = {
        url: 'https://www.fastmock.site/mock/41fa03b4c7422029e00ec4ee0c8063d2/eno-component/api/video',
        method: 'GET',
        params: {
          page: 2
        }
      }
      transformCode.transformModelCode(repository, 'GetVideoParams')
      const modelCode = transformCode._modelCode
      expect(modelCode).toEqual(['export interface GetVideoParams {\n\tpage: number;\n}'])
    })

    test('transformRepositoryCode', () => {
      const repositoryCodeParams: RepositoryCodeParams = {
        method: 'GET',
        paramsType: 'GetVideoParams',
        funcName: 'GetVideo',
        entityType: 'VideoEntity',
        repository: {
          url: 'https://www.fastmock.site/mock/41fa03b4c7422029e00ec4ee0c8063d2/eno-component/api/video',
          method: 'GET',
          params: {
            page: 2
          }
        }
      }
      transformCode.transformRepositoryCode(repositoryCodeParams)
      const repositoryCode = transformCode._repositoryCode
      expect(repositoryCode).toEqual({
        className: 'videoWebRepository',
        abstractClassName: 'videoRepository',
        funcList: [
          {
            method: 'get',
            paramsType: 'GetVideoParams',
            funcName: 'GetVideo',
            returnType: 'VideoEntity',
            requestUrl: '/mock/41fa03b4c7422029e00ec4ee0c8063d2/eno-component/api/video'
          }
        ]
      })
    })

    test('transformUseCaseCode', () => {
      transformCode.transformUseCaseCode('GetVideo', 'GetVideoParams', 'VideoEntity')
      const useCaseCode = transformCode._useCaseCode
      expect(useCaseCode).toEqual([
        {
          classeName: 'GetVideoUsecase',
          paramsType: 'GetVideoParams',
          returnType: 'VideoEntity',
          abstractClass: '[object Object]Repository',
          abstractClassType: 'videoRepository',
          funcName: 'GetVideo'
        }
      ])
    })
  })
})
