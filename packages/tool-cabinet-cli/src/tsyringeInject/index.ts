import { Project, SourceFile, SyntaxKind } from 'ts-morph'
import { ImportClasseType, InjectSourceFileMapType, TsyringeInjectOptionsType } from './interface'
import { ReferencedClasse } from './referencedClasse'
import { getDefaultImport, getNamedImportList } from './utils'

export class TsyringeInject {
  private project: Project
  private mainSource: SourceFile
  private sourceFileList: SourceFile[]
  // 需要忽略的抽象类
  private ignoreAbstractList: string[]

  constructor(options: TsyringeInjectOptionsType) {
    const { ignoreAbstractList = [], mainSourcePath, sourceFilePathList, tsConfigFilePath } = options
    this.ignoreAbstractList = ignoreAbstractList
    this.project = new Project({
      tsConfigFilePath
    })
    this.mainSource = this.project.addSourceFileAtPath(mainSourcePath)
    this.sourceFileList = this.project.addSourceFilesAtPaths(sourceFilePathList)
  }

  public run() {
    const { sourceFileList, ignoreAbstractList } = this
    const referencedClasse = new ReferencedClasse({
      sourceFileList,
      ignoreAbstractList
    })
    const injectSourceFileClassMap = referencedClasse.getInjectSourceFileClassMap()
    const { injectContent, importClasseList } = this.assembleInjectContentAndImportClassList(injectSourceFileClassMap)
    this.mainSource.addImportDeclaration({
      namedImports: ['container'],
      moduleSpecifier: 'tsyringe'
    })
    // 主文件的importList
    const mainSourceImportList = this.mainSource.getImportDeclarations()
    if (mainSourceImportList.length > 0) {
      this.injectAfterLastImport(mainSourceImportList.length, injectContent, importClasseList)
    } else {
      this.mainSource.insertStatements(0, injectContent)
      this.mainSource.addImportDeclarations(importClasseList)
    }
    this.mainSource.save()
  }

  /**
   * 在最后一个import的位置注入代码
   * @param index
   * @param injectContent
   * @param importClasseList
   */
  private injectAfterLastImport(index: number, injectContent: string, importClasseList: ImportClasseType[]) {
    const lastImport = this.mainSource.getLastChildByKind(SyntaxKind.ImportDeclaration).getSourceFile()
    this.mainSource.insertStatements(index, injectContent)
    lastImport.addImportDeclarations(importClasseList)
  }

  /**
   * 组装要被注入的类 和 注入内容
   * @param injectSourceFileClassMap
   * @returns
   */
  public assembleInjectContentAndImportClassList(injectSourceFileClassMap: InjectSourceFileMapType) {
    let injectContent = `//------ inject start ------`
    const importClasseList: ImportClasseType[] = []

    injectSourceFileClassMap.forEach((injectClasseList, sourceFile) => {
      importClasseList.push({
        namedImports: getNamedImportList(injectClasseList),
        moduleSpecifier: this.mainSource.getRelativePathAsModuleSpecifierTo(sourceFile),
        defaultImport: getDefaultImport(injectClasseList)
      })
      for (const injectClasse of injectClasseList) {
        const { abstractClasseName, alias, classeName } = injectClasse
        injectContent += `\ncontainer.register('${abstractClasseName}', {\n  useClass: ${
          alias !== '' ? alias : classeName
        } \n})`
      }
    })

    injectContent += `\n//------ inject end ------`
    return {
      injectContent,
      importClasseList
    }
  }
}

// new TsyringeInject({
//   mainSourcePath: path.join(__dirname, '../__test__/testFile/main.ts'),
//   ignoreAbstractList: [],
//   sourceFilePathList: [path.join(__dirname, '../__test__/testFile/**/*.ts')],
//   tsConfigFilePath: path.join(__dirname, '../__test__/testFile/tsconfig.json')
// }).run()
