import cac from 'cac'
import path from 'path'

import fs from 'fs'
import { loadConfigFromFile } from './config'
import { GenerateRequestCode } from './generateRequestCode'

import { version } from '../package.json'
const rootPath = process.cwd()

const cli = cac('generate-request-code')

const VERSION = version as string

cli.help()
cli.version(VERSION)

cli
  .command('generate')
  .option('--config [config]', 'config path')
  .action(async options => {
    let configFile = ''
    if (options?.config) {
      configFile = path.resolve(rootPath, options?.config)
      console.log(configFile)
    } else {
      configFile = path.resolve(rootPath, 'generate-request-code.config.ts')
      console.log(configFile, 'configFile')
    }
    if (fs.existsSync(configFile)) {
      const config = await loadConfigFromFile(configFile)
      const generateRequestCode = new GenerateRequestCode(config)
      generateRequestCode.run()
    } else {
      throw new Error('配置文件不存在!')
    }
  })
cli.parse()
