import { PluginType, RepositoryType } from 'src/interface'
import { convertType } from 'src/utils'

function covertModelContent(repository: RepositoryType, paramsType: string) {
  let modelTypeContent = ''
  // 判断 是否存在params 参数
  if (repository?.params) {
    modelTypeContent = convertType(JSON.stringify(repository.params), paramsType)
  }
  // 判断 是否存在body 参数
  if (repository?.data) {
    modelTypeContent = convertType(JSON.stringify(repository.data), paramsType)
  }
  return modelTypeContent
}
export const modelTemplate: PluginType = {
  type: 'template',
  name: 'model',
  transform: (module, containerRepository) => {
    const modelTypeContent = []
    const repositorys = containerRepository.getRepository(module)

    repositorys.map(repository => {
      modelTypeContent.push(covertModelContent(repository, repository.templateData.paramsType))
    })

    return {
      fileName: `${module}Model.ts`,
      modelTypeContent
    }
  },
  template: ({ fileName, modelTypeContent }) => {
    return {
      fileName: fileName,
      content: `
        ${modelTypeContent.join('\n')}
      `
    }
  }
}
