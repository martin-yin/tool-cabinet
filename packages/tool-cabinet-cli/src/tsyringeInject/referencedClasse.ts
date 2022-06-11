import { ClassDeclaration, Node, SourceFile, SyntaxKind } from 'ts-morph'
import { InjectClasseType, ReferencedClasseOptions } from './interface'
import { deduplicationByClasseName, spaceReplace } from './utils'
import { AbstractUtilsClasse } from './utils/abstractUtilClasse'

export class ReferencedClasse {
  private sourceFileList: SourceFile[]
  private ignoreAbstractList: string[]

  injectSourceFileClassMap = new Map<SourceFile, InjectClasseType[]>()

  constructor(options: ReferencedClasseOptions) {
    const { sourceFileList, ignoreAbstractList } = options
    this.sourceFileList = sourceFileList
    this.ignoreAbstractList = ignoreAbstractList
  }

  /**
   * 获取要被注入的类
   * @returns
   */
  public getInjectSourceFileClassMap() {
    // 获取所有的抽象类
    const abstractClasseList = AbstractUtilsClasse.GetAbstractClasseList(this.sourceFileList, this.ignoreAbstractList)
    for (const abstractClasse of abstractClasseList) {
      const referencedClasseMap = this.getReferencedClasseMap(abstractClasse)
      const referencedClasseMapKeys = [...referencedClasseMap.keys()]
      referencedClasseMapKeys.map(key => {
        const referencedNode = referencedClasseMap.get(key)
        const referencSourceFile = referencedNode.getSourceFile()
        const injectClasseList = this.getInjectClasseList(referencedNode, referencSourceFile, key)
        this.injectSourceFileClassMap.set(referencSourceFile, injectClasseList)
      })
    }
    return this.injectSourceFileClassMap
  }
  /**
   * 获取要被注入的类
   * @param referencedNode
   * @param referencSourceFile
   * @param abstractClasse
   * @returns
   */
  public getInjectClasseList(
    referencedNode: Node,
    referencSourceFile: SourceFile,
    abstractClasse: string
  ): InjectClasseType[] {
    const injectClasseList: InjectClasseType[] = []
    const classeAbstractMap = new Map<string, string>()
    // 获取引入的抽象类的名称，考虑到引用或导出时会使用 as 别名，所以不用 "abstractClasse" (抽象类的真实名称)
    const importAbstractClasse = spaceReplace(referencedNode.getFullText())
    // 不知道具体是那个class实现了抽象类，所以需要遍历这个文件中所有的class。
    for (const referencClasse of referencSourceFile.getClasses()) {
      // 获取被类实现的抽象类
      const implementAbstractClasse = spaceReplace(referencClasse.getImplements()[0].getFullText())
      /**
       * 利用ts-morph 查询出了引用链关系。
       * importAbstractClasse 则是 引用的"abstractClasse"(抽象类)
       * 那么就需要判断当前这个class 是否实现了"abstractClasse"
       * 还有就是忽略某个抽象类
       */
      if (importAbstractClasse === implementAbstractClasse) {
        // 那么这个类就是要被注入的类。
        const injectClasse = this.getClasseByKeywordAndAssignOfExport(referencClasse, abstractClasse)
        classeAbstractMap.set(spaceReplace(referencClasse.getName()), abstractClasse)
        injectClasseList.push(injectClasse)
      }
    }
    return deduplicationByClasseName(
      [...injectClasseList, ...this.getClasseListByExportDeclaration(referencSourceFile, classeAbstractMap)].reverse()
    )
  }

  /**
   *
   * @param referencSourceFile
   * @param classeAbstractMap
   * @returns
   */
  public getClasseListByExportDeclaration(referencSourceFile: SourceFile, classeAbstractMap: Map<string, string>) {
    const injectClasseList: InjectClasseType[] = []
    const exportList = referencSourceFile
      .getChildrenOfKind(SyntaxKind.ExportDeclaration)[0]
      .getChildrenOfKind(SyntaxKind.NamedExports)[0]
    if (exportList) {
      for (const exportItem of exportList.getChildrenOfKind(SyntaxKind.ExportSpecifier)) {
        // 判断是否使用了别名导出
        const [classe, alias] = exportItem.getChildrenOfKind(SyntaxKind.Identifier)
        const exportClasse = spaceReplace(classe.getFullText())
        const classeAbstract = classeAbstractMap.get(exportClasse)
        if (classeAbstract) {
          injectClasseList.push({
            classeName: spaceReplace(classe.getFullText()),
            alias: spaceReplace(alias.getFullText()),
            abstractClasseName: classeAbstract,
            defaultExport: ''
          })
        }
      }

      return injectClasseList
    }
  }

  /**
   *
   * @param referencClasse
   * @param abstractClasseName
   * @returns
   */
  public getClasseByKeywordAndAssignOfExport(referencClasse: ClassDeclaration, abstractClasseName: string) {
    // 获取类名称
    const classeName = spaceReplace(referencClasse.getName())
    // 因为能够确定当前的类实现了继承，所以类和抽象类有关系。
    // classeAbstractMap.set(classeName, abstractClasseName)
    /**
     * 如果是默认导出
     * export default class XXXX
     */
    if (referencClasse.isDefaultExport()) {
      return {
        defaultExport: classeName,
        classeName,
        alias: '',
        abstractClasseName: abstractClasseName
      }
    }
    /**
     * 如果类被导出了 那么就存储起来。
     * 在最后一步骤，做一次去重。
     */
    if (referencClasse.isExported()) {
      return {
        defaultExport: '',
        classeName,
        alias: '',
        abstractClasseName: abstractClasseName
      }
    }
  }

  /**
   * 获取引用抽象类的 Node
   * @param classe
   * @returns
   */
  private getReferencedClasseMap(classe: ClassDeclaration) {
    const referencedClasseMap = new Map<string, Node>()
    try {
      const referencedstractClasseName = AbstractUtilsClasse.GetClasseName(classe)
      const referencedSymbols = classe.findReferences()
      if (referencedSymbols) {
        for (const referencedSymbol of referencedSymbols) {
          for (const reference of referencedSymbol.getReferences()) {
            const referencedNode = reference.getNode()
            const importDeclaration = referencedNode.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
            // 如果存在引用关系
            if (importDeclaration) {
              referencedClasseMap.set(referencedstractClasseName, referencedNode)
            }
          }
        }
      }
      return referencedClasseMap
    } catch (e) {
      throw new Error(`获取抽象类引用链失败：${e.message}`)
    }
  }
}
