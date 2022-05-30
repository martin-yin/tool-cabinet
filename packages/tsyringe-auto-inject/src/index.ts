import { ClassDeclaration, ImportDeclaration, Project, SourceFile, SyntaxKind } from 'ts-morph'
import { AbstractUtils } from './utils/abstract.utils'

/**
 *
 * @param value
 * @returns string
 */
function spaceReplace(value: string): string {
  return value.replace(/\s*/g, '')
}

type IgnoreAbstractListType = string[]

interface ReferenceAbstract {
  abstractName: string
  exportAbstractName: string
  importAbstractName: string
}
type ReferenceAbstractList = ReferenceAbstract[]

interface AutoInjiectOptions {
  ignoreAbstractList: IgnoreAbstractListType
  mainPath: string
  sourceListPath: string[]
}

interface InjectClasse {
  sourceFile: SourceFile
  exportClassList: Array<string>
  implementsClassList: Array<{
    abstractName: string
    exportClass: string
  }>
}

type InjectClasseList = Array<InjectClasse>

class AutoInjiect {
  ignoreAbstractList: IgnoreAbstractListType
  project: Project
  mainSource: SourceFile
  sourceFileList: SourceFile[]
  referenceAbstractList: ReferenceAbstractList = []
  referenceSourceFileList: SourceFile[] = []
  injectClassList: InjectClasseList = []

  constructor(options: AutoInjiectOptions) {
    this.ignoreAbstractList = options.ignoreAbstractList
    this.project = new Project({
      tsConfigFilePath: './tsconfig.json',
      compilerOptions: {
        outDir: './src'
      }
    })
    this.mainSource = this.project.addSourceFileAtPath('./src/main.tsx')
    this.sourceFileList = this.project.addSourceFilesAtPaths(['./src/domain/**/*.ts', './src/infrastructure/**/*.ts'])
  }

  start() {
    this.eachSourceFileList()
    this.writeMainSourceFile()
  }

  // 遍历获取到的 sourceFileList
  eachSourceFileList() {
    for (const sourceFile of this.sourceFileList) {
      const classList = sourceFile.getClasses()
      for (const classe of classList) {
        // 判断这个class是否是抽象类
        if (AbstractUtils.isAbstract(classe) && classe.isExported()) {
          const abstractName = AbstractUtils.getAbstractNames(classe)
          if (!this.ignoreAbstractList.includes(abstractName)) {
            //如果是在同一个文件里声明了抽象类，并且继承了。
            const implementsInFile = this.isImplementsInFile(classList, abstractName)
            if (implementsInFile) {
              const { classSourceFile, abstractName } = implementsInFile
              this.addReferenceAbstract(abstractName, abstractName, abstractName)
              this.referenceSourceFileList.push(classSourceFile)
            } else {
              const abstractClass = AbstractUtils.getAbstractClass(sourceFile, abstractName)
              const referencesourceFile = this.getReferenceSourceFile(abstractClass, abstractName)
              if (referencesourceFile) {
                const { abstractName, importAbstractName, exportAbstractName, referenceSourceFile } =
                  referencesourceFile
                this.addReferenceAbstract(abstractName, importAbstractName, exportAbstractName)
                this.referenceSourceFileList.push(referenceSourceFile)
              }
            }
          }
        }
      }
    }
  }

  getRealImportAbstractName(abstractName: string, exportAbstractName: string, importDeclaration: ImportDeclaration) {
    for (const item of importDeclaration
      .getChildren()[1]
      .getChildren()[0]
      .getChildrenOfKind(SyntaxKind.ImportSpecifier)) {
      const importName = item.getChildrenOfKind(SyntaxKind.Identifier)
      if (abstractName === abstractName && exportAbstractName === spaceReplace(importName[0].getFullText())) {
        const importAbstractName = importName.length == 1 ? importName[0].getFullText() : importName[1].getFullText()
        return spaceReplace(importAbstractName)
      }
    }
  }

  getReferenceSourceFile(classe: ClassDeclaration, abstractName: string) {
    const referenceClass = this.getFindReferenceClass(classe, abstractName)
    if (referenceClass) {
      const { exportAbstractName, importAbstractName, referenceSourceFile } = referenceClass
      return {
        abstractName,
        importAbstractName,
        exportAbstractName,
        referenceSourceFile
      }
    }
  }

  getFindReferenceClass(classe: ClassDeclaration, abstractName: string) {
    const referencedSymbols = classe.findReferences()
    for (const referencedSymbol of referencedSymbols) {
      for (const reference of referencedSymbol.getReferences()) {
        const referenceNode = reference.getNode()
        const importDeclaration = referenceNode.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
        if (importDeclaration !== null) {
          // 这里还需要修改下，不应该用 search 判断，应该获取AST 节点在判断继承的 abstract
          if (referenceNode.getSourceFile().getFullText().search(`implements ${abstractName}`) > 0) {
            const exportAbstractName = referenceNode.getFullText().replace(/\s*/g, '')
            // 存在一种情况
            // 导出的时候用了as,引用时候用了as.
            const importAbstractName = this.getRealImportAbstractName(
              abstractName,
              exportAbstractName,
              importDeclaration
            )
            if (importAbstractName) {
              return {
                exportAbstractName: spaceReplace(referenceNode.getFullText()),
                importAbstractName: importAbstractName,
                referenceSourceFile: referenceNode.getSourceFile()
              }
            }
          }
        }
      }
    }
  }

  /**
   * 有3个名字。
   * 1. 定义的 抽象类名字
   * 2. 在当前文件里导出的名字(如果使用了as 别名)
   * 3. 在另外一个文件里引用时的名字(如果使用了as 别名)
   * 添加被继承的Abstract名称
   * @param abstract
   * @param exportAbstract
   * @param importAbstract
   */
  addReferenceAbstract(abstract: string, exportAbstract: string, importAbstract: string) {
    this.referenceAbstractList.push({
      abstractName: abstract,
      exportAbstractName: exportAbstract,
      importAbstractName: importAbstract
    })
  }

  /**
   * 判断在 当前文件里是否实现了继承关系。
   * @param classList
   * @param abstractName
   * @returns
   */
  isImplementsInFile(classList: ClassDeclaration[], abstractName: string) {
    for (const classe of classList) {
      const heritageClause = classe.getChildrenOfKind(SyntaxKind.HeritageClause)
      if (heritageClause.length > 0) {
        const implementsName = spaceReplace(
          heritageClause[0].getChildrenOfKind(SyntaxKind.ExpressionWithTypeArguments)[0].getFullText()
        )
        if (implementsName === abstractName) {
          const classSourceFile = classe.getSourceFile()
          return { classSourceFile, abstractName }
        }
      }
    }
    return null
  }

  getInjectClassList() {
    const referenceFileList = Array.from(new Set(this.referenceSourceFileList))
    for (const referenceFile of referenceFileList) {
      const exportClassList = []
      const implementsClassList: Array<{
        abstractName: string
        exportClass: string
      }> = []
      const exportedDeclarations = referenceFile.getExportedDeclarations()
      for (const exportClass of exportedDeclarations.keys()) {
        const exportedDeclaration = exportedDeclarations.get(exportClass)
        const heritageClauseList = exportedDeclaration[0].getChildrenOfKind(SyntaxKind.HeritageClause)
        if (heritageClauseList.length > 0) {
          const heritageClause = heritageClauseList[0]
            .getChildrenOfKind(SyntaxKind.ExpressionWithTypeArguments)[0]
            .getFullText()
          if (heritageClause) {
            const exportedDeclarationAbsName = heritageClause.replace(/\s*/g, '')
            for (const inject of this.referenceAbstractList) {
              if (
                exportedDeclarationAbsName == inject.abstractName ||
                exportedDeclarationAbsName == inject.exportAbstractName ||
                exportedDeclarationAbsName == inject.importAbstractName
              ) {
                // exportName 这个class名字数组
                exportClassList.push(exportClass)
                implementsClassList.push({
                  abstractName: inject.abstractName,
                  exportClass
                })
              }
            }
          }
        }
      }
      this.injectClassList.push({
        sourceFile: referenceFile,
        exportClassList,
        implementsClassList
      })
    }
  }

  writeMainSourceFile() {
    this.getInjectClassList()
    const lastImport = this.mainSource.getLastChildByKind(SyntaxKind.ImportDeclaration).getSourceFile()
    lastImport.addImportDeclaration({
      namedImports: ['container'],
      moduleSpecifier: 'tsyringe'
    })
    const importClass = []
    let inject = ``
    // 这里可以优化。
    for (const injectClass of this.injectClassList) {
      importClass.push({
        namedImports: injectClass.exportClassList,
        moduleSpecifier: this.mainSource.getRelativePathAsModuleSpecifierTo(injectClass.sourceFile)
      })
      for (const implementsClass of injectClass.implementsClassList) {
        inject += `\n container.register('${implementsClass.abstractName}', {\n  useClass: ${implementsClass.exportClass} \n})`
      }
    }
    this.mainSource.insertStatements(this.mainSource.getImportDeclarations().length, inject)
    lastImport.addImportDeclarations(importClass)
    this.mainSource.save()
  }
}

new AutoInjiect({
  ignoreAbstractList: [],
  mainPath: './src/main.tsx',
  sourceListPath: ['./src/domain/**/*.ts', './src/infrastructure/**/*.ts']
}).start()
