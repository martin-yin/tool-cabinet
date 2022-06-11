import { PluginType } from '../interface'
import { firstToLower, firstToUpper } from '../utils'

export const useCaseTemplate: PluginType = {
  type: 'template',
  name: 'usecase',
  transform: (module, containerRepository) => {
    const repositorys = containerRepository.getRepository(module)
    const useCaseList = []
    repositorys.map(repository => {
      const { funcName, paramsType, returnType } = repository.templateData
      const classeName = firstToUpper(funcName) + 'Usecase'
      useCaseList.push({
        directory: `/domain/${module}/application/`,
        fileName: `${firstToLower(classeName)}.ts`,
        classeName,
        paramsType,
        returnType,
        abstractClass: `${module}Repository`,
        abstractClassType: firstToUpper(module) + 'Repository',
        funcName
      })
    })

    return useCaseList
  },
  template: ({
    directory,
    fileName,
    classeName,
    abstractClass,
    paramsType,
    returnType,
    funcName,
    abstractClassType
  }) => {
    return {
      directory,
      fileName: fileName,
      content: `
        import { MessageService } from '@/infrastructure/interface/message'
        import { UseCase } from '@/infrastructure/interface/use.case'
        import { inject, injectable } from 'tsyringe'
        @injectable()
        export class ${classeName} implements UseCase<${paramsType === '' ? 'void' : paramsType}, ${returnType}> {
          constructor(
            @inject('${abstractClassType}') private ${abstractClass}: ${abstractClassType},
            @inject('MessageService') private messageService: MessageService,
          ) {}
          async execute(${paramsType === '' ? '' : 'params:' + paramsType}): Promise<${returnType}> {
            const { data, code, msg } = await this.${abstractClass}.${funcName}${paramsType === '' ? '()' : '(params)'}
            if (code === 200) {
              return data
            } else {
              this.messageService.error(msg)
              return null
            }
          }
        }
      `
    }
  }
}
