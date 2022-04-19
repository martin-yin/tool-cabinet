import { DomainType, RepositoryType, SourceCodeType } from "./interface";
import { getNames, getPathName, repositoryRequest } from "./utils";
import { Json2Ts } from "./utils/json2ts";

export abstract class ISourceCode {
  abstract assembleModelSource(
    repository: RepositoryType,
    paramsName: string
  ): string;

  abstract assembleModelSource(
    repository: RepositoryType,
    paramsName: string
  ): void;
}

export class SourceCode implements ISourceCode {
  json2ts: Json2Ts;

  constructor() {
    this.json2ts = new Json2Ts();
  }

  assembleModelSource(repository: RepositoryType, paramsName: string) {
    let paramsType = "";
    if (repository?.params) {
      paramsType = this.json2ts.convert(
        JSON.stringify(repository.params),
        paramsName
      );
    }
    if (repository?.body) {
      const bodyName = paramsName;
      paramsType = this.json2ts.convert(
        JSON.stringify(repository.body),
        bodyName
      );
    }
    return paramsType;
  }

  async mapFormSourceCode(domain: DomainType) {
    const sourceCode: SourceCodeType = {
      entityTypeList: [],
      modelTypeList: [],
      functionList: [],
    };
    const { module, repositorys } = domain;
    for (const repository of repositorys) {
      const { method } = repository;
      const { entity, params, abstractFunc } = getNames(
        method,
        module,
        repository.url
      );
      // 发送请求
      const result = await repositoryRequest(repository);
      if (result) {
        // 请求完成后生成 ts 类型。
        sourceCode.entityTypeList.push(
          this.json2ts.convert(JSON.stringify(result), entity)
        );
        sourceCode.modelTypeList.push(
          this.assembleModelSource(repository, params)
        );
        sourceCode.functionList.push({
          abstractFunc: abstractFunc,
          params,
          method,
          return: entity,
          requestUrl: getPathName(repository.url),
        });
      } else {
        throw Error(`${repository.url} 请求失败`);
      }
    }
    return sourceCode;
  }
}
