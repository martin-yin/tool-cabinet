import { Method } from "axios";

export interface RepositoryType {
  url: string;
  method: Method;
  params?: any;
  body?: any;
}

export interface DomainType {
  module: string;
  repositorys: RepositoryType[];
}

export interface CodeGenerateOptionsType {
  domains: DomainType[];
}

export interface RepositoryTemplateFunctionType {
  abstractFunc: string;
  method: string;
  return: string;
  requestUrl: string;
  params?: string;
}

export interface RepositoryTemplateType {
  name: string;
  functionList: RepositoryTemplateFunctionType[];
}

export interface EntityTemplateType {
  entity: string;
  functionList: RepositoryTemplateFunctionType[];
  entityTypeList: string[];
}
