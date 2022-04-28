import { RepositoryType } from '../interface'
import { ModelSourceCodeType } from '../interface/sourceCode'
import { transformType } from '../utils'

export class ModelSourceCode {
  modelTypeContent: ModelSourceCodeType['modelTypeContent'] = []
  modulePath: string
  module: string

  constructor(modulePath: string, module: string) {
    this.modulePath = `${modulePath}/model/`
    this.module = module
  }

  pushModel(repository: RepositoryType, paramsType: string) {
    this.modelTypeContent.push(this.transformModelContent(repository, paramsType))
  }

  private transformModelContent(repository: RepositoryType, paramsType: string) {
    let modelTypeContent = ''
    // 判断 是否存在params 参数
    if (repository?.params) {
      modelTypeContent = transformType(JSON.stringify(repository.params), paramsType)
    }
    // 判断 是否存在body 参数
    if (repository?.body) {
      modelTypeContent = transformType(JSON.stringify(repository.body), paramsType)
    }
    return modelTypeContent
  }

  getModel() {
    return {
      filePath: this.modulePath,
      fileName: `${this.module}Model.ts`,
      template: 'model',
      code: {
        modelTypeContent: this.modelTypeContent
      }
    }
  }
}
