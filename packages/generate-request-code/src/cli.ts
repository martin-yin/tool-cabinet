import cac from 'cac'
import fs from 'fs'
import path from 'path'
import { GenerateRequestCode } from './generateRequestCode'
const rootPath = process.cwd()

function cliInit() {
  const cli = cac('generate-request-code')
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
    const generateRequestCode = new GenerateRequestCode(config)
    generateRequestCode.run()
  } catch (error) {
    throw new Error(`读取配置文件错误: ${error.message}`)
  }
}
start()