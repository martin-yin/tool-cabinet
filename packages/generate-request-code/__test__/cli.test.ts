describe('cli.test', () => {
  test('rootPath', () => {
    const rootPath = process.cwd()
    const configPath = '/config.js'
    const config = require(rootPath + configPath)
  })
})
