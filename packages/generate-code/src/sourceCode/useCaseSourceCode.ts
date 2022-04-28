import { UseCaseListType, UseCaseSourceCodeType } from '../interface/sourceCode'
import { firstToLower, firstToUpper } from '../utils'

export class UseCaseSourceCode {
  useCaseCode: UseCaseListType = []

  modulePath: string
  module: string

  constructor(modulePath: string, module: string) {
    this.modulePath = `${modulePath}/application/`
    this.module = module
  }

  pushUseCase(funcName: string, paramsType: string, entityType: string) {
    const classeName = firstToUpper(funcName) + 'Usecase'
    this.useCaseCode.push({
      fileName: `${firstToLower(classeName)}.ts`,
      classeName: classeName,
      paramsType: paramsType,
      returnType: entityType,
      abstractClass: this.module + 'Repository',
      abstractClassType: firstToUpper(this.module) + 'Repository',
      funcName: funcName
    })
  }

  getUseCaseMap(): UseCaseSourceCodeType {
    return this.useCaseCode.map(item => {
      return {
        filePath: this.modulePath,
        template: 'useCase',
        fileName: item.fileName,
        code: item
      }
    })
  }
}
