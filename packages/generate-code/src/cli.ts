import cac from 'cac'
import fs from 'fs'
import path from 'path'
import { GenerateCode } from './generateCode'
const rootPath = process.cwd()

function cliInit() {
  const packageJson = require(path.resolve(rootPath, './package.json'))
  const cli = cac(packageJson.name)
  cli.option('--config', 'config path')
  return cli.parse()
}

function start() {
  const { args } = cliInit()
  const configPath = path.resolve(rootPath, args[0])
  try {
    const configJson = fs.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(configJson)
    if (config.filePath == '') {
      throw new Error('配置文件地址不能为空')
    }
    const generateCode = new GenerateCode(config)
    generateCode.run()
  } catch (error) {
    throw new Error(`读取配置文件错误: ${error.message}`)
  }
}
start()
