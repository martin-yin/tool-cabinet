import cac from 'cac'
import { version } from '../package.json'
import { loadGenerateRepositoryCodeConfig, loadTsyringeInjectConfig } from './config'
import { GenerateRepositoryCode } from './generateRepositoryCode'
import { TsyringeInject } from './tsyringeInject'
const VERSION = version as string

const cli = cac('tool-cabinet-cli')

cli.help()
cli.version(VERSION)

cli.option('-c, --config <file>', `[string] 配置文件地址`)

type Options = {
  config: string
}

cli.command('generate-request-code', '通过repository生成代码').action(async (options: Options) => {
  const config = await loadGenerateRepositoryCodeConfig(options?.config)
  const generateRequestCode = new GenerateRepositoryCode(config)
  generateRequestCode.run()
})

cli.command('tsyringe-inject', '生成tsyringe需要注入代码').action(async options => {
  const config = await loadTsyringeInjectConfig(options?.config)
  const tsyringeInject = new TsyringeInject(config)
  tsyringeInject.run()
})

cli.parse()
