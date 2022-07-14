import path from 'node:path'

import {
  converFileToStr,
  filterFileListOfIgnoreList,
  formatIgnoreList,
  getFileListDisplayOfExtension,
  getIncludeIgnoreFileMap,
  toArray
} from '../utils'

jest.useFakeTimers()

describe('elvin-upload', () => {
  it('includeIgnoreFileMap', async () => {
    const include = ['./']

    const ignoreList: Array<string> = await formatIgnoreList({
      ignore: ['node_modules'],
      ignoreFile: './.gitignore'
    })

    const includeIgnoreFileMap = await getIncludeIgnoreFileMap(toArray(include), ignoreList, '')

    expect(includeIgnoreFileMap.get('./')?.ignoreList.length).toBe(33)
    expect(includeIgnoreFileMap.get('./')?.urlPrefix).toBe('')
  })

  it('get sourceMapFileList', async () => {
    const include = ['./']

    const ignoreList: Array<string> = await formatIgnoreList({
      ignore: ['node_modules'],
      ignoreFile: './.gitignore'
    })

    const includeIgnoreFileMap = await getIncludeIgnoreFileMap(toArray(include), ignoreList, '~path')

    const sourceMapFileList: Array<Record<string, unknown>> = []

    for (const [key, value] of includeIgnoreFileMap) {
      const includeIgnoreFile = value
      const filePath = path.join(__dirname, key)
      const fileListDisplay = getFileListDisplayOfExtension(filePath)
      const includeFileList = filterFileListOfIgnoreList(fileListDisplay, includeIgnoreFile?.ignoreList)

      includeFileList.forEach(file => {
        sourceMapFileList.push({
          file: converFileToStr(file),
          fileName: file,
          urlPrefix: includeIgnoreFile?.urlPrefix
        })
      })
    }

    expect(sourceMapFileList.length).toBe(1)
    expect(sourceMapFileList[0].fileName).toBe(
      'packages\\rollup-elvin-upload\\src\\__test__\\sourceMapFile\\jsErrorEntity.fc9faf55.js.map'
    )
    expect(sourceMapFileList[0].urlPrefix).toBe('~path')
  })
})
