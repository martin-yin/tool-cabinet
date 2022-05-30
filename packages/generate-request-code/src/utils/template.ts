import colors from 'picocolors'
import { entityTemplate } from '../plugins/entityTemplate'
import { modelTemplate } from '../plugins/modelTemplate'
import { repositoryTemplate } from '../plugins/repositoryTemplate'
import { useCaseTemplate } from '../plugins/useCaseTemplate'

const template = {
  entity: entityTemplate,
  model: modelTemplate,
  repository: repositoryTemplate,
  useCase: useCaseTemplate
}

export const getTemplateByKey = new Proxy(template, {
  get(target, phrase: string) {
    if (phrase in target) {
      return Reflect.get(target, phrase)
    } else {
      console.log(colors.red(`没有查询到${phrase}Template 模板\n`))
      return null
    }
  }
})
