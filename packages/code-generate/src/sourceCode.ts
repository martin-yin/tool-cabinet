import { DomainType, RepositoryType, SourceCodesType, UseCaseSourceType } from './interface'
import { firstToUpper, getNames, getPathName, repositoryRequest } from './utils'
import { Json2Ts } from './utils/json2ts'

export abstract class ISourceCode {
  abstract assembleEntitySource(result: any, entityType: string, funcName: string, paramsType: string): void
  abstract assembleModelSource(repository: RepositoryType, paramsType: string): void
  abstract assembleRepositorySource(
    method: string,
    paramsType: string,
    funcName: string,
    entityType: string,
    repository: RepositoryType
  ): void
  abstract assembleUseCaseSource(paramsType: string, entityType: string, funcName: string): void
  abstract mapFormSourceCode(domain: DomainType): Promise<SourceCodesType>
  abstract initSourceCode(): void
}

export class SourceCode implements ISourceCode {
  json2ts: Json2Ts
  module: string
  sourceCodes: SourceCodesType

  constructor() {
    this.json2ts = new Json2Ts()
    this.initSourceCode()
  }

  assembleEntitySource(result: any, entityType: string, funcName: string, paramsType: string) {
    const { entitySource } = this.sourceCodes
    const { abstractClassList } = entitySource
    entitySource.entityTypeContent.push(this.json2ts.convert(JSON.stringify(result), entityType))
    abstractClassList.abstractClassName = `${firstToUpper(this.module)}Repository`
    abstractClassList.abstractFuncList.push({
      funcName: funcName,
      paramsType: paramsType,
      returnType: entityType
    })
  }

  assembleModelSource(repository: RepositoryType, paramsType: string) {
    const { modelTypeContent } = this.sourceCodes.modelSource
    let paramsTypeContent = ''
    // 判断 是否存在params 参数
    if (repository?.params) {
      paramsTypeContent = this.json2ts.convert(JSON.stringify(repository.params), paramsType)
    }
    // 判断 是否存在body 参数
    if (repository?.body) {
      paramsTypeContent = this.json2ts.convert(JSON.stringify(repository.body), paramsType)
    }
    modelTypeContent.push(paramsTypeContent)
  }

  assembleRepositorySource(
    method: string,
    paramsType: string,
    funcName: string,
    entityType: string,
    repository: RepositoryType
  ) {
    const { repositorySource } = this.sourceCodes
    const { funcList } = repositorySource
    repositorySource.className = `${firstToUpper(this.module)}WebRepository`
    repositorySource.abstractClassName = `${firstToUpper(this.module)}Repository`
    funcList.push({
      method: method,
      paramsType,
      funcName: funcName,
      returnType: entityType,
      requestUrl: getPathName(repository.url)
    })
  }

  assembleUseCaseSource(paramsType: string, entityType: string, funcName: string) {
    const {
      useCaseSource: { useCaseList }
    } = this.sourceCodes

    useCaseList.push({
      classeName: funcName + 'Usecase',
      paramsType: paramsType,
      returnType: entityType,
      abstractClass: module + 'Repository',
      abstractClassType: firstToUpper(this.module) + 'Repository',
      funcName: funcName
    })
  }

  initSourceCode() {
    this.sourceCodes = {
      entitySource: {
        entityTypeContent: [],
        abstractClassList: {
          abstractClassName: '',
          abstractFuncList: []
        }
      },
      modelSource: {
        modelTypeContent: []
      },
      repositorySource: {
        className: '',
        abstractClassName: '',
        funcList: []
      },
      useCaseSource: {
        useCaseList: []
      }
    }
  }

  async mapFormSourceCode(domain: DomainType): Promise<SourceCodesType> {
    const { module, repositorys } = domain
    this.module = module
    for (const repository of repositorys) {
      const { method } = repository
      const { entityType, paramsType, funcName } = getNames(method, module, repository.url)
      // 发送请求
      const result = await repositoryRequest(repository)

      if (result) {
        this.assembleEntitySource(result, entityType, funcName, paramsType)
        this.assembleModelSource(repository, paramsType)
        this.assembleRepositorySource(method, paramsType, funcName, entityType, repository)
        this.assembleUseCaseSource(paramsType, entityType, funcName)
      } else {
        throw Error(`${repository.url} 请求失败`)
      }
    }
    return this.sourceCodes
  }
}
