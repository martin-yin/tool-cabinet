import colors from 'picocolors'
import { entityTemplate } from 'src/plugins/entityTemplate'
import { modelTemplate } from 'src/plugins/modelTemplate'
import { repositoryTemplate } from 'src/plugins/repositoryTemplate'
import { useCaseTemplate } from 'src/plugins/useCaseTemplate'

const template = {
  entity: entityTemplate,
  model: modelTemplate,
  repository: repositoryTemplate,
  useCase: useCaseTemplate
}

export const getTemplate = new Proxy(template, {
  get(target, phrase: string) {
    if (phrase in target) {
      return Reflect.get(target, phrase)
    } else {
      console.log(colors.red(`没有查询到${phrase}Template 模板\n`))
      return null
    }
  }
})
