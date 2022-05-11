import path from 'path'
import { existDirectoryCreate, generateFile } from '../../src/utils/file'
import fs from 'fs'

jest.mock('colors', () => ({
  green: jest.fn(),
  blue: jest.fn(),
  red: jest.fn()
}))

describe('file.test.ts', () => {
  describe('Test existDirectoryCreate', () => {
    test('empty dir', async () => {
      const result = await existDirectoryCreate('')
      expect(result).toBe(false)
    })

    test('real dir', async () => {
      const result = await existDirectoryCreate('C:/Users/martin-yin/Desktop')
      expect(result).toBe(true)
    })
  })

  describe('Test generateFile', () => {
    const basePath = path.resolve()
    const filePath = `${basePath}/testGenerateFile.txt`

    afterAll(() => {
      fs.unlink(filePath, err => {
        if (err) throw err
      })
    })

    test('generateFile success', async () => {
      const result = await generateFile(basePath, 'testGenerateFile.txt', 'just test write file')
      expect(result).toBe(true)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      expect(fileContent).toBe('just test write file')
    })

    test('generateFile fail', async () => {
      const result = await generateFile(basePath, 'testGenerateFile.txt', 'just test write file')
      expect(result).toBe(false)
    })
  })
})
