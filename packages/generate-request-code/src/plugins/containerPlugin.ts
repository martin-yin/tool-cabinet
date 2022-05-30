import { ContainerRepository } from '../containerRepository'
import { OptionsType, PluginType, TemplaetType } from '../interface'
import { getTemplateByKey } from '../utils/template'

const defaultTemplatePluginsKey = ['entity', 'model', 'repository', 'useCase']

export class ContainerPlugin {
  public templatePlugins: PluginType[] = []
  constructor(plugins: OptionsType['plugins']) {
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
        plugins.push(getTemplateByKey[item])
      })
      this.templatePlugins = this.sortPlugins(plugins, defaultTemplatePluginsKey)
    } else {
      defaultTemplatePluginsKey.map(key => {
        plugins.push(getTemplateByKey[key])
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
