import { ClassDeclaration, SourceFile } from 'ts-morph'

export class AbstractUtils {
  static isAbstract(classes: ClassDeclaration) {
    return classes.isAbstract()
  }

  static getAbstractNames(classe: ClassDeclaration) {
    return classe.getName()
  }

  static getAbstractClass(sourceFile: SourceFile, abstractName: string) {
    return sourceFile.getClass(abstractName)
  }
}
