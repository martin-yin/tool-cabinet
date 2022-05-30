import { AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ContainerRepository } from '../containerRepository'

export type RepositoryType = AxiosRequestConfig & {
  result?: any
  [x: string]: any
}

export type DomainType = {
  module: string
  repositorys: RepositoryType[]
}

export type TemplaetType = {
  directory: string
  fileName: string
  content: string
}

export type PluginType = {
  type: 'template'
  name: 'entity' | 'usecase' | 'model' | 'repository'
  transform: (module: string, containerRepository: ContainerRepository) => any
  template: (data: any) => TemplaetType
}

export type OptionsType = {
  baseFilePath: string
  requestConfig?: AxiosRequestConfig
  interceptorRequest?: (config: AxiosRequestConfig<any>) => AxiosInterceptorManager<AxiosRequestConfig>
  interceptorResponse?: (config: AxiosResponse<any, any>) => any
  domains: DomainType[]
  plugins?: PluginType[]
}
