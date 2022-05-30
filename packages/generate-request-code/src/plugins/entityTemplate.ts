import { PluginType } from '../interface'
import { convertType, firstToUpper, getEntityType, getNames } from '../utils'

function getEntity(module: string, method: string, result: any) {
  let entityTypeContent = ''
  let entityType = getEntityType(method, module)
  entityTypeContent += convertType(JSON.stringify(result), entityType)
  if (Array.isArray(result)) {
    entityTypeContent += `\n export type ${entityType}List = ${entityType}[]`
    entityType = `${entityType}List`
  }
  return { entityTypeContent, entityType }
}

export const entityTemplate: PluginType = {
  type: 'template',
  name: 'entity',
  transform: (module, containerRepository) => {
    const repositorys = containerRepository.getRepository(module)
    const entityTypeContentList = []
    const funcList = []

    repositorys.map(repository => {
      const { entityTypeContent, entityType } = getEntity(module, repository.method, repository.result)
      const { paramsType, funcName } = getNames(module, repository)
      entityTypeContentList.push(entityTypeContent)
      funcList.push({
        funcName: funcName,
        paramsType: paramsType,
        returnType: entityType
      })
      repository.templateData = {
        funcName,
        paramsType,
        returnType: entityType
      }
    })
    containerRepository.registerRepository(module, repositorys)
    return {
      directory: `/domain/${module}/model/`,
      fileName: `${module}Entity.ts`,
      className: `${firstToUpper(module)}Repository`,
      funcList: funcList,
      entityTypeContent: entityTypeContentList
    }
  },
  template: ({ directory, fileName, className, funcList, entityTypeContent }) => {
    return {
      directory,
      fileName,
      content: `
          import { IResponse } from '@/infrastructure/lib/request'
          export abstract class ${className} {
            ${funcList
              .map(item => {
                return `abstract ${item.funcName}(${
                  item.paramsType !== '' ? 'params: ' + item.paramsType : ''
                }): Promise<IResponse<${item.returnType}>>`
              })
              .join('\n')}
          }
          ${entityTypeContent.join('\n')}
        `
    }
  }
}
