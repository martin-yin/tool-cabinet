import { SourceFile } from 'ts-morph'

export type ReferenceAbstract = {
  abstractName: string
  exportAbstractName: string
  importAbstractName: string
}
export type ReferenceAbstractList = ReferenceAbstract[]

export type AutoInjiectOption = {
  ignoreAbstractList: string[]
  mainSourcePath: string
  sourceFilePathList: string[]
  tsConfigFilePath: string
}

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
