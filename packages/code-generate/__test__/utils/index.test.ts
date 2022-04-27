import { getFuncName, getNames, getUrlLast } from '../../src/utils'

describe('index.test.ts', () => {
  test('Test getFuncName', () => {
    const funcName = getFuncName('GET', 'Admin', 'video')
    expect(funcName).toBe('getAdminVideo')
  })

  test('Test getUrlLast', () => {
    const last = getUrlLast('https://www.fastmock.site/mock/41fa03b4c7422029e00ec4ee0c8063d2/eno-component/api/video')
    expect(last).toBe('video')
  })

  test('Test getNames', () => {
    const { funcName } = getNames('video', {
      url: 'https://www.fastmock.site/mock/41fa03b4c7422029e00ec4ee0c8063d2/eno-component/api/video',
      method: 'GET',
      params: {
        page: 2
      }
    })
    expect(funcName).toBe('getVideo')
  })
})
