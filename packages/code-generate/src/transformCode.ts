import chalk from 'chalk'
import { isObject } from 'underscore'
import {
  RepositoryType,
  DomainType,
  SourceCodeType,
  EntityCodeType,
  ModelCodeType,
  RepositoryCodeType,
  UseCaseCodeType
} from './interface'
import { firstToUpper, getPathName, repositoryRequest, getNames } from './utils'
import { Json2Ts } from './utils/json2ts'

export type RepositoryCodeParams = {
  method: string
  paramsType: string
  funcName: string
  entityType: string
  repository: RepositoryType
}

export abstract class ITransformCode {
  abstract initSourceCode(): void
  abstract transformEntityCode(result: any, entityType: string, funcName: string, paramsType: string): void
  abstract transformModelCode(repository: RepositoryType, paramsType: string): void
  abstract transformRepositoryCode(data: RepositoryCodeParams): void
  abstract transformUseCaseCode(paramsType: string, entityType: string, funcName: string): void
  abstract transformSourceCode(domain: DomainType): Promise<SourceCodeType>
}

export class TransformCode implements ITransformCode {
  _entityCode: EntityCodeType = null
  _modelCode: ModelCodeType
  _repositoryCode: RepositoryCodeType
  _useCaseCode: UseCaseCodeType

  _json2ts: Json2Ts
  _module: string

  constructor() {
    this._json2ts = new Json2Ts()
    this.initSourceCode()
  }

  initSourceCode() {
    this._entityCode = {
      entityTypeContent: [],
      abstractClassList: {
        abstractClassName: '',
        abstractFuncList: []
      }
    }
    this._modelCode = []
    this._repositoryCode = {
      className: '',
      abstractClassName: '',
      funcList: []
    }
    this._useCaseCode = []
  }

  transformEntityCode(result: any, entityType: string, funcName: string, paramsType: string) {
    const { abstractClassList, entityTypeContent } = this._entityCode
    entityTypeContent.push(this._json2ts.convert(JSON.stringify(result), entityType))
    abstractClassList.abstractClassName = `${firstToUpper(this._module)}Repository`
    abstractClassList.abstractFuncList.push({
      funcName: funcName,
      paramsType: paramsType,
      returnType: entityType
    })
  }

  transformModelCode(repository: RepositoryType, paramsType: string) {
    let paramsTypeContent = ''
    // 判断 是否存在params 参数
    if (repository?.params) {
      paramsTypeContent = this._json2ts.convert(JSON.stringify(repository.params), paramsType)
    }
    // 判断 是否存在body 参数
    if (repository?.body) {
      paramsTypeContent = this._json2ts.convert(JSON.stringify(repository.body), paramsType)
    }
    this._modelCode.push(paramsTypeContent)
  }

  transformRepositoryCode(data: RepositoryCodeParams) {
    const { funcList } = this._repositoryCode
    this._repositoryCode.className = `${firstToUpper(this._module)}WebRepository`
    this._repositoryCode.abstractClassName = `${firstToUpper(this._module)}Repository`
    funcList.push({
      method: data.method,
      paramsType: data.paramsType,
      funcName: data.funcName,
      returnType: data.entityType,
      requestUrl: getPathName(data.repository.url)
    })
  }

  transformUseCaseCode(funcName: string, paramsType: string, entityType: string) {
    this._useCaseCode.push({
      classeName: funcName + 'Usecase',
      paramsType: paramsType,
      returnType: entityType,
      abstractClass: module + 'Repository',
      abstractClassType: firstToUpper(this._module) + 'Repository',
      funcName: funcName
    })
  }

  async transformSourceCode(domain: DomainType): Promise<SourceCodeType> {
    const { module, repositorys } = domain
    this._module = module
    for (const repository of repositorys) {
      // 抽离成一个函数 each repositorys
      const result = await repositoryRequest(repository)
      const { entityType, paramsType, funcName, method } = getNames(module, repository)
      console.log(entityType, 'entityType')
      if (result && isObject(result)) {
        this.transformEntityCode(result, entityType, funcName, paramsType)
        this.transformModelCode(repository, paramsType)
        // this.transformRepositoryCode({ method, paramsType, funcName, entityType, repository })
        // this.transformUseCaseCode(funcName, paramsType, entityType)
      } else {
        throw Error(chalk.blue(`${repository.url} 请求失败 或 请求返回的数据不是对象`))
      }
    }
    return
  }
}
