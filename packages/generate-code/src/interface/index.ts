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

export interface GenerateCodeOptionsType {
  filePath: string
  domains: DomainType[]
}
