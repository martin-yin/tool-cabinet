import { isObject } from 'underscore'
import { DomainType } from '../interface'
import { SourceCodeListType, SourceCodesParams } from '../interface/sourceCode'
import { getNames, repositoryRequest, transformType } from '../utils'
import { EntitySourceCode } from './entitySourceCode'
import { ModelSourceCode } from './modelSourceCode'
import { RepositorySourceCode } from './repositorySourceCode'
import { UseCaseSourceCode } from './useCaseSourceCode'

export class SourceCode {
  private entitySourceCode: EntitySourceCode
  private modelSourceCode: ModelSourceCode
  private repositorySourceCode: RepositorySourceCode
  private useCaseSourceCode: UseCaseSourceCode
  sourceCodeList: SourceCodeListType = []

  async transformSourceCode(modulePath: string, domain: DomainType) {
    const { module, repositorys } = domain
    this.entitySourceCode = new EntitySourceCode(modulePath, module)
    this.modelSourceCode = new ModelSourceCode(modulePath, module)
    this.repositorySourceCode = new RepositorySourceCode(modulePath, module)
    this.useCaseSourceCode = new UseCaseSourceCode(modulePath, module)
    for (const repository of repositorys) {
      const result = await repositoryRequest(repository)
      const { entityType, paramsType, funcName, method } = getNames(module, repository)
      if (result && isObject(result)) {
        const entityTypeContent = transformType(JSON.stringify(result), entityType)
        this.pushSourceCodes({ entityType, entityTypeContent, module, funcName, paramsType, repository, method })
      } else {
        // TODO封装错误函数
        throw Error(`${repository.url} 请求失败 或 请求返回的数据不是对象`)
      }
    }
    this.combinationSourceCode()
    return this.sourceCodeList
  }

  private combinationSourceCode() {
    this.sourceCodeList.push(
      ...[
        this.entitySourceCode.getEntity(),
        this.modelSourceCode.getModel(),
        this.repositorySourceCode.getRepository(),
        ...this.useCaseSourceCode.getUseCaseMap()
      ]
    )
  }

  private pushSourceCodes(sourceCodes: SourceCodesParams) {
    const { entityType, entityTypeContent, funcName, paramsType, repository, method } = sourceCodes
    this.entitySourceCode.pushEntity({
      entityTypeContent: entityTypeContent,
      entityType,
      funcName,
      paramsType
    })
    this.modelSourceCode.pushModel(repository, paramsType)
    this.repositorySourceCode.pushRepositoryFunc({ method, paramsType, funcName, entityType, repository })
    this.useCaseSourceCode.pushUseCase(funcName, paramsType, entityType)
  }
}
