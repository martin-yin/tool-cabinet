import { AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ContainerRepository } from 'src/containerRepository'

export type RepositoryType = AxiosRequestConfig & {
  result?: any
  [x: string]: any
}

export interface DomainType {
  module: string
  repositorys: RepositoryType[]
}

export type PluginType = {
  type: 'template'
  name: 'entity' | 'usecase' | 'model' | 'repository'
  transform: (module: string, containerRepository: ContainerRepository) => any
  template: (data: any) => { fileName: string; content: string }
}

export interface GenerateRequestCodeOptionsType {
  baseFilePath: string
  requestConfig?: AxiosRequestConfig
  interceptorRequest?: (config: AxiosRequestConfig<any>) => AxiosInterceptorManager<AxiosRequestConfig>
  interceptorResponse?: (config: AxiosResponse<any, any>) => any
  domains: DomainType[]
  plugins?: PluginType[]
}
