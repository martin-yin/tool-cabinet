import { AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ContainerRepository } from '../containerRepository'

export type RepositoryType = AxiosRequestConfig & {
  result?: any
  [x: string]: any
}

/**
 * @readonly
 */
export type DomainType = {
  module: string
  repositorys: RepositoryType[]
}

/**
 * @readonly
 */
export type TemplaetType = {
  directory: string
  fileName: string
  content: string
}

/**
 * 自定义插件时使用此类型
 * @public
 */
export type PluginType = {
  type: 'template'
  name: 'entity' | 'usecase' | 'model' | 'repository'
  transform: (module: string, containerRepository: ContainerRepository) => any
  template: (data: any) => TemplaetType
}

/**
 * @public
 */
export type OptionsType = {
  baseFilePath: string
  requestConfig?: AxiosRequestConfig
  interceptorRequest?: (config: AxiosRequestConfig<any>) => AxiosInterceptorManager<AxiosRequestConfig>
  interceptorResponse?: (config: AxiosResponse<any, any>) => any
  domains: DomainType[]
  plugins?: PluginType[]
}
