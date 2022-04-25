import { GenerateCode } from '../src/generateCode'
import { TransformCode } from '../src/transformCode'
import { WriteFile } from '../src/writeFile'

jest.useFakeTimers()
const chalk = require('chalk')

jest.mock('chalk', () => ({
  green: jest.fn(),
  blue: jest.fn(),
  red: jest.fn()
}))

describe('generateCode.test.ts', () => {
  describe('Test GenerateCode options', () => {
    describe('options filePath', () => {
      test('empty', async () => {
        const generateCode = new GenerateCode(
          {
            filePath: '',
            domains: []
          },
          new TransformCode(),
          new WriteFile()
        )
        await expect(generateCode.run()).rejects.toThrowError('filePath不能为空!')
      })
    })

    describe('options domains', () => {
      test('not array', async () => {
        const generateCode = new GenerateCode(
          {
            filePath: 'Admin',
            domains: null
          },
          new TransformCode(),
          new WriteFile()
        )
        await expect(generateCode.run()).rejects.toThrowError('domains不是数组!')
      })

      test('length 0', async () => {
        const generateCode = new GenerateCode(
          {
            filePath: 'Admin',
            domains: []
          },
          new TransformCode(),
          new WriteFile()
        )
        await expect(generateCode.run()).rejects.toThrowError('domains 长度不能为0!')
      })
    })
  })
})
