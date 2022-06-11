import { AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ContainerRepository } from '../containerRepository'

/**
 * @public
 */
export type RepositoryType = AxiosRequestConfig & {
  result?: any
  [x: string]: any
}

/**
 * @public
 */
export type DomainType = {
  module: string
  repositorys: RepositoryType[]
}

/**
 * @public
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
 * generateRepositoryCode 所需要的参数
 * @public
 */
export type GenerateRepositoryCodeOptionsType = {
  baseFilePath: string
  requestConfig?: AxiosRequestConfig
  interceptorRequest?: (config: AxiosRequestConfig<any>) => AxiosInterceptorManager<AxiosRequestConfig>
  interceptorResponse?: (config: AxiosResponse<any, any>) => any
  domains: DomainType[]
  plugins?: PluginType[]
}
