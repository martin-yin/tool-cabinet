import { ContainerRepository } from 'src/containerRepository'
import { GenerateRequestCodeOptionsType, PluginType } from 'src/interface'
import { getTemplate } from 'src/utils/template'

const defaultPluginsKey = ['entity', 'model', 'repository', 'useCase']

export class ContainerPlugin {
  public plugins = []
  constructor(plugins: GenerateRequestCodeOptionsType['plugins']) {
    this.plugins = this.mergePlugins(plugins)
  }

  public usePlugins(module: string, plugins: PluginType[], containerRepository: ContainerRepository) {
    plugins.map(async plugin => {
      const { transform, template } = plugin
      const result = transform(module, containerRepository)
      if (Array.isArray(result)) {
        result.map(usecase => {
          // const { fileName, content } = template(usecase)
        })
      } else {
        //   const { fileName, content } = template(result)
      }
    })
  }

  private mergePlugins(plugins = []) {
    if (plugins.length > 0) {
      const pluginTypeList = plugins.map(item => item.name)
      this.arrayDifference(pluginTypeList, defaultPluginsKey).map(item => {
        plugins.push(getTemplate[item])
      })
      this.plugins = this.sortPlugins(plugins, defaultPluginsKey)
    } else {
      defaultPluginsKey.map(key => {
        plugins.push(getTemplate[key])
      })
    }
    return plugins
  }

  private sortPlugins(plugins: PluginType[], order: Array<string>) {
    plugins.sort(a => {
      return order.indexOf(a.type) - order.indexOf(a.type)
    })
    return plugins
  }

  private arrayDifference(keysOne: Array<string>, keysTwo: Array<string>): Array<string> {
    return Array.from(
      new Set(keysOne.concat(keysTwo).filter(v => !new Set(keysOne).has(v) || !new Set(keysTwo).has(v)))
    )
  }
}
