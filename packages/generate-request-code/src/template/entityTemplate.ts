import { EntitySourceCodeType } from '../interface/sourceCode'

export const entityTemplate = ({ entityTypeContent, abstractClassName, abstractFuncList }: EntitySourceCodeType) => {
  return `
    import { IResponse } from '@/infrastructure/lib/request'
    
    export abstract class ${abstractClassName} {
      ${abstractFuncList
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
