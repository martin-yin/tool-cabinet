import { Method } from 'axios'

export interface RepositoryType {
  url: string
  method: Method
  params?: any
  body?: any
}

export interface DomainType {
  module: string
  repositorys: RepositoryType[]
}

export interface GenerateRequestCodeOptionsType {
  filePath: string
  domains: DomainType[]
}
