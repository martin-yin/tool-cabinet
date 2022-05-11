import { AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios'

export type RepositoryType = AxiosRequestConfig

export interface DomainType {
  module: string
  repositorys: RepositoryType[]
}

export interface GenerateRequestCodeOptionsType {
  filePath: string
  requestConfig?: AxiosRequestConfig
  interceptorRequest?: (config: AxiosRequestConfig<any>) => AxiosInterceptorManager<AxiosRequestConfig>
  interceptorResponse?: (config: AxiosResponse<any, any>) => any
  domains: DomainType[]
}
