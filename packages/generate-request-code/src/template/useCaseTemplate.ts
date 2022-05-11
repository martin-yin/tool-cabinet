import { UseCaseType } from '../interface/sourceCode'

export const useCaseTemplate = (usecase: UseCaseType) => {
  return `
  import { MessageService } from '@/infrastructure/interface/message'
  import { UseCase } from '@/infrastructure/interface/use.case'
  import { inject, injectable } from 'tsyringe'

  @injectable()
  export class ${usecase.classeName} implements UseCase<${usecase.paramsType === '' ? 'void' : usecase.paramsType}, ${
    usecase.returnType
  }> {
    constructor(
      @inject('${usecase.abstractClassType}') private ${usecase.abstractClass}: ${usecase.abstractClassType},
      @inject('MessageService') private messageService: MessageService,
    ) {}
    async execute(${usecase.paramsType === '' ? '' : 'params:' + usecase.paramsType}): Promise<${usecase.returnType}> {
      const { data, code, msg } = await this.${usecase.abstractClass}.${usecase.funcName}${
    usecase.paramsType === '' ? '()' : '(params)'
  }
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
