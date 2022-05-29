import { PluginType } from 'src/interface'
import { firstToUpper, getPathName } from 'src/utils'

export const repositoryTemplate: PluginType = {
  type: 'template',
  name: 'repository',
  transform: (module, containerRepository) => {
    const repositorys = containerRepository.getRepository(module)
    const funcList = []

    repositorys.map(repository => {
      funcList.push({
        method: repository.method,
        paramsType: repository.templateData.paramsType,
        funcName: repository.templateData.funcName,
        returnType: repository.templateData.returnType,
        requestUrl: getPathName(repository.url)
      })
    })
    return {
      fileName: `${module}Repository.ts`,
      className: `${firstToUpper(module)}WebRepository`,
      abstractClassName: `${firstToUpper(module)}Repository`,
      funcList
    }
  },
  template: ({ fileName, className, abstractClassName, funcList }) => {
    return {
      fileName,
      content: `
        import { HttpService } from '@/infrastructure/interface/http'
        import { IResponse } from '@/infrastructure/lib/request'
        import { inject, injectable } from 'tsyringe'
        @injectable()
        export class ${className} implements ${abstractClassName} {
          constructor(@inject('HttpService') private webHttpService: HttpService) {}
      
          ${funcList
            .map(item => {
              return `
            async ${item.funcName}(${item.paramsType !== '' ? 'params: ' + item.paramsType : ''}): Promise<IResponse<${
                item.returnType
              }>> {
              return await this.webHttpService.${item.method}('${item.requestUrl}' ${
                item.paramsType !== '' ? ',params' : ''
              })
            }
            `
            })
            .join('\n')}
          }
      `
    }
  }
}
