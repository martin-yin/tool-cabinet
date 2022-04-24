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

export interface GenerateCodeOptionsType {
  filePath: string
  domains: DomainType[]
}

export type AbstractFunc = Record<'funcName' | 'paramsType' | 'returnType', string>

export interface AbstractClassListType {
  abstractClassName: string
  abstractFuncList: AbstractFunc[]
}

export interface EntityCodeType {
  entityTypeContent: string[]
  abstractClassList: AbstractClassListType
}

export type ModelCodeType = string[]

export interface FuncType extends AbstractFunc {
  method: string
  requestUrl: string
}

export interface RepositoryCodeType {
  className: string
  abstractClassName: string
  funcList: FuncType[]
}

export interface SourceCodeType {
  entityCode: EntityCodeType
  modelCode: ModelCodeType
  repositoryCode: RepositoryCodeType
  useCaseCode: UseCaseCodeType
}

export interface UseCaseType {
  classeName: string
  paramsType: string
  abstractClass: string
  abstractClassType: string
  returnType: string
  funcName: string
}

export type UseCaseCodeType = UseCaseType[]
