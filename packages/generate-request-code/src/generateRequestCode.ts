import { isObject } from 'underscore'
import { ContainerRepository } from './containerRepository'
import { GenerateRequestCodeOptionsType, RepositoryType } from './interface'
import { ContainerPlugin } from './plugins'
import { RequestRepository } from './requestRepository'

export class GenerateRequestCode {
  public options: GenerateRequestCodeOptionsType = {
    baseFilePath: '',
    domains: [],
    plugins: []
  }
  private service: RequestRepository
  private containerRepository: ContainerRepository
  private containerPlugin: ContainerPlugin

  constructor(options: GenerateRequestCodeOptionsType) {
    const { requestConfig, interceptorRequest, interceptorResponse, baseFilePath, domains, plugins = [] } = options
    this.options = {
      domains,
      baseFilePath
    }
    this.containerRepository = new ContainerRepository()
    this.containerPlugin = new ContainerPlugin(plugins)
    this.service = new RequestRepository({ requestConfig, interceptorRequest, interceptorResponse })
  }

  async run() {
    const {
      options: { domains, plugins }
    } = this
    for (const domain of domains) {
      const { repositorys, module } = domain
      for (const repository of repositorys) {
        const result = await this.service.request(repository)
        this.validateResult(repository, result)
        repository.result = result
      }
      this.containerRepository.registerRepository(module, repositorys)
      this.containerPlugin.usePlugins(module, plugins, this.containerRepository)
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
  }
}
