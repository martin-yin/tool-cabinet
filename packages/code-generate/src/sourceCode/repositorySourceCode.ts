import { RepositoryCodeParams, RepositoryFuncType } from '../interface/sourceCode'
import { firstToUpper, getPathName } from '../utils'

export class RepositorySourceCode {
  className: string
  abstractClassName: string
  funcList: RepositoryFuncType[] = []
  modulePath: string
  module: string

  constructor(modulePath: string, module: string) {
    this.className = `${firstToUpper(module)}WebRepository`
    this.abstractClassName = `${firstToUpper(module)}Repository`
    this.modulePath = `${modulePath}/repository/`
    this.module = module
  }

  pushRepositoryFunc(data: RepositoryCodeParams) {
    this.funcList.push({
      method: data.method,
      paramsType: data.paramsType,
      funcName: data.funcName,
      returnType: data.entityType,
      requestUrl: getPathName(data.repository.url)
    })
  }

  getRepository() {
    return {
      filePath: this.modulePath,
      fileName: `${this.module}Repository.ts`,
      template: 'repository',
      code: {
        className: this.className,
        abstractClassName: this.abstractClassName,
        funcList: this.funcList
      }
    }
  }
}
