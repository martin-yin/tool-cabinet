import { RepositoryCodeType } from '../interface'

export const repositoryTemplate = ({ className, abstractClassName, funcList }: RepositoryCodeType) => {
  return `
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
        return await this.webHttpService.${item.method}('${item.requestUrl}' ${item.paramsType !== '' ? ',params' : ''})
      }
      `
      })
      .join('\n')}
    }
`
}
