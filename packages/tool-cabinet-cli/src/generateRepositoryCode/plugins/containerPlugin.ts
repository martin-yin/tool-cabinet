import colors from 'picocolors'
import { ContainerRepository } from '../containerRepository'
import { GenerateRepositoryCodeOptionsType, PluginType, TemplaetType } from '../interface'
import { entityTemplate } from './entityTemplate'
import { modelTemplate } from './modelTemplate'
import { repositoryTemplate } from './repositoryTemplate'
import { useCaseTemplate } from './useCaseTemplate'

const defaultTemplatePluginsKey = ['entity', 'model', 'repository', 'useCase']

const templatePlugins = {
  entity: entityTemplate,
  model: modelTemplate,
  repository: repositoryTemplate,
  useCase: useCaseTemplate
}

export const getTemplatePluginByKey = new Proxy(templatePlugins, {
  get(target, phrase: string) {
    if (phrase in target) {
      return Reflect.get(target, phrase)
    } else {
      console.log(colors.red(`没有查询到${phrase}Template 模板\n`))
      return null
    }
  }
})

export class ContainerPlugin {
  public templatePlugins: PluginType[] = []
  constructor(plugins: GenerateRepositoryCodeOptionsType['plugins']) {
    this.templatePlugins = this.mergeTemplatePlugins(plugins)
  }
  private sortPlugins(plugins: PluginType[], templateOrder: Array<string>) {
    plugins.sort(a => {
      return templateOrder.indexOf(a.type) - templateOrder.indexOf(a.type)
    })
    return plugins
  }

  private differencePlugins(keysOne: Array<string>, keysTwo: Array<string>): Array<string> {
    return Array.from(
      new Set(keysOne.concat(keysTwo).filter(v => !new Set(keysOne).has(v) || !new Set(keysTwo).has(v)))
    )
  }

  private mergeTemplatePlugins(plugins = []) {
    if (plugins.length > 0) {
      const templatePluginKeys = plugins.map(item => {
        if (item.type == 'template') {
          return item.name
        }
      })
      this.differencePlugins(templatePluginKeys, defaultTemplatePluginsKey).map(item => {
        plugins.push(getTemplatePluginByKey[item])
      })
      this.templatePlugins = this.sortPlugins(plugins, defaultTemplatePluginsKey)
    } else {
      defaultTemplatePluginsKey.map(key => {
        plugins.push(getTemplatePluginByKey[key])
      })
    }
    return plugins
  }

  public useTemplatePlugins(module: string, containerRepository: ContainerRepository): TemplaetType[] {
    let templateList: TemplaetType[] = []
    this.templatePlugins.map(plugin => {
      const { transform, template } = plugin
      const result = transform(module, containerRepository)
      if (Array.isArray(result)) {
        result.map(usecase => {
          templateList.push(template(usecase))
        })
      } else {
        templateList.push(template(result))
      }
    })
    return templateList
  }
}
