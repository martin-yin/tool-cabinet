import { Method } from 'axios'

export interface RepositoryType {
  url: string
  method: Method
  params?: any
  body?: any
}

export interface DomainType {
  module: string
  repositorys: RepositoryType[]
}

export interface CodeGenerateOptionsType {
  filePath: string
  domains: DomainType[]
}

export type AbstractFunc = Record<'funcName' | 'paramsType' | 'returnType', string>

export interface AbstractClassListType {
  abstractClassName: string
  abstractFuncList: AbstractFunc[]
}

export interface EntitySourceType {
  entityTypeContent: string[]
  abstractClassList: AbstractClassListType
}

export interface ModelSourceType {
  modelTypeContent: string[]
}

export interface FuncType extends AbstractFunc {
  method: string
  requestUrl: string
}

export interface RepositorySourceType {
  className: string
  abstractClassName: string
  funcList: FuncType[]
}

export interface SourceCodesType {
  entitySource: EntitySourceType
  modelSource: ModelSourceType
  repositorySource: RepositorySourceType
  useCaseSource: UseCaseSourceType
}

export interface UseCaseType {
  classeName: string
  paramsType: string
  abstractClass: string
  abstractClassType: string
  returnType: string
  funcName: string
}

export interface UseCaseSourceType {
  useCaseList: UseCaseType[]
}
