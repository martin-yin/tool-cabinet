import cac from 'cac'
import path from 'path'
import { loadConfigFromFile } from './config'
import { GenerateRequestCode } from './generateRequestCode'
const rootPath = process.cwd()

function cliInit() {
  const cli = cac('generate-request-code')
  cli.option('--config', 'config path')
  return cli.parse()
}

async function start() {
  const { args } = cliInit()
  const configFile = path.resolve(rootPath, args[0])
  const config = await loadConfigFromFile(configFile)
  const generateRequestCode = new GenerateRequestCode(config)
  generateRequestCode.run()
}
start()
