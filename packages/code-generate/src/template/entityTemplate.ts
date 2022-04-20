import { EntitySourceType } from '../interface'

export const entityTemplate = ({ entityTypeContent, abstractClassList }: EntitySourceType) => {
  return `
    import { IResponse } from '@/infrastructure/lib/request'
    
    export abstract class ${abstractClassList.abstractClassName} {
      ${abstractClassList.abstractFuncList
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
