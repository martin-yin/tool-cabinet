import { RepositoryType } from '.'

export type TemplateType = 'entity' | 'model' | 'repository' | 'useCase' | any
export type CodeType = EntitySourceCodeType | ModelSourceCodeType | RepositorySourceCodeType | UseCaseType

export type SourceCodeType = {
  filePath: string
  fileName: string
  template: TemplateType
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

export type RepositoryCodeParams = Record<'method' | 'paramsType' | 'funcName' | 'entityType', string> &
  Record<'repository', RepositoryType>

export type RepositorySourceCodeType = {
  className: string
  abstractClassName: string
  funcList: RepositoryFuncType[]
}

export type UseCaseType = Record<
  'fileName' | 'classeName' | 'paramsType' | 'abstractClass' | 'abstractClassType' | 'returnType' | 'funcName',
  string
>

export type UseCaseListType = UseCaseType[]

export type UseCaseSourceCodeType = Array<SourceCodeType>

export type SourceCodesParams = Record<
  'entityType' | 'entityTypeContent' | 'module' | 'funcName' | 'paramsType' | 'method',
  string
> &
  Record<'repository', RepositoryType>
