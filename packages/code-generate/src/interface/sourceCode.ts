import { RepositoryType } from '.'

export type TemplateType = 'entity' | 'model' | 'repository' | 'useCase'
export type CodeType = EntitySourceCodeType | ModelSourceCodeType | RepositorySourceCodeType | UseCaseType

export type SourceCodeType = {
  filePath: string
  fileName: string
  template: 'entity' | 'model' | 'repository' | 'useCase' | any
  code: CodeType
}
export type SourceCodeListType = Array<SourceCodeType>

export type AbstractFunc = Record<'funcName' | 'paramsType' | 'returnType', string>

export type EntitySourceCodeType = {
  entityTypeContent: string[]
  abstractClassName: string
  abstractFuncList: AbstractFunc[]
}

export type ModelSourceCodeType = {
  modelTypeContent: Array<string>
}

export interface RepositoryFuncType extends AbstractFunc {
  method: string
  requestUrl: string
}

export type RepositoryCodeParams = {
  method: string
  paramsType: string
  funcName: string
  entityType: string
  repository: RepositoryType
}

export type RepositorySourceCodeType = {
  className: string
  abstractClassName: string
  funcList: RepositoryFuncType[]
}

export type UseCaseType = {
  fileName: string
  classeName: string
  paramsType: string
  abstractClass: string
  abstractClassType: string
  returnType: string
  funcName: string
}
export type UseCaseListType = UseCaseType[]

export type UseCaseSourceCodeType = Array<SourceCodeType>

export type SourceCodesParams = {
  entityType: string
  entityTypeContent: string
  module: string
  funcName: string
  paramsType: string
  repository: RepositoryType
  method: string
}
