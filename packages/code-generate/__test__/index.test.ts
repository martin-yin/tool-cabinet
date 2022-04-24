import { TransformCode } from '../src/transformCode'

jest.useFakeTimers()
const chalk = require('chalk')

jest.mock('chalk', () => ({
  green: jest.fn(),
  blue: jest.fn(),
  red: jest.fn()
}))

describe('index.test.ts', () => {
  it('just run', () => {
    expect('just run').toEqual('just run')
  })

  it('Test TransformCode transformEntityCode', () => {
    // const transformCodeFile = require('../src/generateCode')
    const transformCode = new TransformCode()

    const result = {
      method: 'GET',
      url: 'http://192.168.5.12:8080/sockjs-node/info?t=1633007488664',
      type: 'xhr',
      load_time: 5,
      action: 'httpInfo'
    }
    transformCode._module = 'Test'
    transformCode.transformEntityCode(result, 'Test', 'getTest', '')

    expect(transformCode._entityCode.abstractClassList).toEqual({
      abstractClassName: 'testRepository',
      abstractFuncList: [{ funcName: 'getTest', paramsType: '', returnType: 'Test' }]
    })
  })
})
