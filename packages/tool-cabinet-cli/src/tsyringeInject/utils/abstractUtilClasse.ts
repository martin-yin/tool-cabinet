import { ClassDeclaration, SourceFile } from 'ts-morph'
import { spaceReplace } from '.'

export class AbstractUtilsClasse {
  static IsAbstract(classes: ClassDeclaration) {
    return classes.isAbstract()
  }

  /**
   * @param classe
   * @returns
   */
  static GetClasseName(classe: ClassDeclaration) {
    return spaceReplace(classe.getName())
  }

  /**
   * @param sourceFile
   * @param abstractName
   * @returns
   */
  static GetClasse(sourceFile: SourceFile, abstractName: string) {
    return sourceFile.getClass(abstractName)
  }

  /**
   * 获取抽象类
   * @param sourceFileList
   * @param ignoreAbstractList 需要被忽略的类名
   * @returns
   */
  public static GetAbstractClasseList(sourceFileList: SourceFile[], ignoreAbstractList = []) {
    const abstractClasseList: ClassDeclaration[] = []
    for (const sourceFile of sourceFileList) {
      for (const classe of sourceFile?.getClasses()) {
        const classeName = AbstractUtilsClasse.GetClasseName(classe)
        if (classe?.isAbstract() && classe.isExported() && !ignoreAbstractList.includes(classeName)) {
          abstractClasseList.push(classe)
        }
      }
    }
    if (abstractClasseList.length > 0) {
      return abstractClasseList
    } else {
      throw Error('没有查询到抽象类')
    }
  }
}
