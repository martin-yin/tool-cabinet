import path from 'node:path'
import { converFileToStr, filterFileListOfIgnoreList, formatIgnoreList, getFileListDisplayOfExtension } from '../utils'

jest.useFakeTimers()

describe('utils', () => {
  describe('formatIgnoreList', () => {
    it('ignore and ignoreFile not empty', async () => {
      const ignoreList = await formatIgnoreList({
        ignore: ['node_modules'],
        ignoreFile: './.gitignore'
      })

      expect(ignoreList.length).toBe(33)
    })

    it('ignore empty', async () => {
      const ignoreList = await formatIgnoreList({
        ignoreFile: './.gitignore'
      })

      expect(ignoreList.length).toBe(32)
    })

    it('ignoreFile empty', async () => {
      const ignoreList = await formatIgnoreList({
        ignore: ['node_modules']
      })

      expect(ignoreList.length).toBe(1)
    })

    it('all empty', async () => {
      const ignoreList = await formatIgnoreList()

      expect(ignoreList.length).toBe(0)
    })
  })

  it('getFileListDisplayOfExtension', () => {
    expect(getFileListDisplayOfExtension(path.join(__dirname, '../'), [], '.ts').length).toBe(5)
  })

  it('filterFileListOfIgnoreList', () => {
    const fileList = getFileListDisplayOfExtension(path.join(__dirname, '../'), [], '.ts')

    expect(filterFileListOfIgnoreList(fileList, ['utils.ts']).length).toBe(4)
  })
})
