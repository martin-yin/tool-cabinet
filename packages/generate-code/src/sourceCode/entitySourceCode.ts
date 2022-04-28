import { AbstractFunc } from '../interface/sourceCode'
import { firstToUpper } from '../utils'

export class EntitySourceCode {
  entityTypeContent: Array<string> = []
  abstractClassName: string
  abstractFuncList: AbstractFunc[] = []
  modulePath: string
  module: string

  constructor(modulePath: string, module: string) {
    this.modulePath = `${modulePath}/model/`
    this.module = module
  }

  pushEntity({ entityTypeContent, entityType, funcName, paramsType }) {
    this.entityTypeContent.push(entityTypeContent)
    this.abstractClassName = `${firstToUpper(this.module)}Repository`
    this.abstractFuncList.push({
      funcName: funcName,
      paramsType: paramsType,
      returnType: entityType
    })
  }

  getEntity() {
    return {
      filePath: `${this.modulePath}`,
      fileName: `${this.module}Entity.ts`,
      template: 'entity',
      code: {
        entityTypeContent: this.entityTypeContent,
        abstractClassName: this.abstractClassName,
        abstractFuncList: this.abstractFuncList
      }
    }
  }
}
