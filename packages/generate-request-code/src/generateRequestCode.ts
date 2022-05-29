import colors from 'picocolors'
import { isObject } from 'underscore'
import { ContainerRepository } from './containerRepository'
import { OptionsType, RepositoryType } from './interface'
import { ContainerPlugin } from './plugins/containerPlugin'
import { RequestRepository } from './requestRepository'
import { generateFile } from './utils/file'

export class GenerateRequestCode {
  public options: Omit<OptionsType, 'plugins'> = {
    baseFilePath: '',
    domains: []
  }
  private service: RequestRepository
  private containerPlugin: ContainerPlugin

  constructor(options: OptionsType) {
    const { requestConfig, interceptorRequest, interceptorResponse, baseFilePath, domains, plugins = [] } = options
    this.options = {
      domains,
      baseFilePath
    }
    this.containerPlugin = new ContainerPlugin(plugins)
    this.service = new RequestRepository({ requestConfig, interceptorRequest, interceptorResponse })
  }

  async run() {
    const {
      options: { domains, baseFilePath }
    } = this
    for (const domain of domains) {
      const { repositorys, module } = domain
      for (const repository of repositorys) {
        const result = await this.service.request(repository)
        if (this.validateResult(repository, result)) {
          repository.result = result
        }
      }
      ContainerRepository.registerRepository(module, repositorys)
      const templateList = this.containerPlugin.useTemplatePlugins(module)
      for (const template of templateList) {
        generateFile(baseFilePath, template.fileName, template.content)
      }
      console.log(colors.blue(`模块${module}执行结束\n`))
    }
  }

  private validateResult(repository: RepositoryType, result: any) {
    if (!isObject(result)) {
      throw Error(
        `请求失败，请求url: ${repository.url}, repository: ${JSON.stringify(
          repository
        )},错误原因: 请求返回的结果不是对象`
      )
    }
    if (Array.isArray(result)) {
      throw Error(
        `请求失败，请求url: ${repository.url}, repository: ${JSON.stringify(
          repository
        )},错误原因: 请求返回的结果不是数组`
      )
    }
    return true
  }
}
