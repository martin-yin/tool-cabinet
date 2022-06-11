import { SourceFile } from 'ts-morph'

/**
 * @internal
 */
export type ReferenceAbstract = {
  abstractName: string
  exportAbstractName: string
  importAbstractName: string
}
/**
 *  @internal
 */
export type ReferenceAbstractList = ReferenceAbstract[]

/**
 * tsyringeInject 所需要的参数
 * @public
 */
export type TsyringeInjectOptionsType = {
  ignoreAbstractList?: string[]
  mainSourcePath: string
  sourceFilePathList: string[]
  tsConfigFilePath: string
}

/**
 *  @internal
 */
export type InjectClasse = {
  sourceFile: SourceFile
  exportClassList: Array<string>
  implementsClassList: Array<{
    abstractName: string
    exportClass: string
  }>
}

export type InjectClasseList = Array<InjectClasse>

export type InjectClasseType = {
  classeName: string
  alias: string
  abstractClasseName: string
  defaultExport: string
}

export type ReferencedClasseOptions = {
  sourceFileList: SourceFile[]
  ignoreAbstractList: string[]
}

export type ImportClasseType = {
  namedImports: string[]
  moduleSpecifier: string
  defaultImport: string
}

export type InjectSourceFileMapType = Map<SourceFile, InjectClasseType[]>
