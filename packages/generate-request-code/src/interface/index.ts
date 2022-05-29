import { AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios'

export type RepositoryType = AxiosRequestConfig & {
  result?: any
  [x: string]: any
}

export type DomainType = {
  module: string
  repositorys: RepositoryType[]
}

export type TemplaetType = {
  fileName: string
  content: string
}
export type PluginType = {
  type: 'template'
  name: 'entity' | 'usecase' | 'model' | 'repository'
  transform: (module: string) => any
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
