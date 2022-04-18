import axios, { Method } from "axios";
import fs from "fs";
import path from "path";
import parse from "url-parse";
import { Json2Ts } from "./utils/json2ts";
import { entityTemplate } from "./utils/template/entityTemplate";
import {
  CodeGenerateOptionsType,
  EntityTemplateType,
  RepositoryType,
} from "./interface";
import { generateFile } from "./utils/file";
import { repositoryTemplate } from "./utils/template/repositoryTemplate";
import { modelTemplate } from "./utils/template/modelTemplate";

function fristToUpperCase(str: string) {
  const newStr = str.trim().toLowerCase();
  return newStr
    .split("-")
    .map((value: string) => firstToUpper(value))
    .join("");
}

function firstToUpper(str: string) {
  return str.trim().toLowerCase().replace(str[0], str[0].toUpperCase());
}

class CodeGenerate {
  public options: CodeGenerateOptionsType;
  json2ts: Json2Ts;

  basePath: string;
  constructor(options: CodeGenerateOptionsType) {
    this.options = options;
    this.json2ts = new Json2Ts();
    this.basePath = path.join(__dirname);
  }

  private async getRepositoryResponse(
    repository: RepositoryType
  ): Promise<any> {
    const result = await axios.request({
      url: repository.url,
      params: repository?.params,
      data: repository?.body,
      method: repository.method,
    });
    if (result.status == 200) {
      return result.data;
    }
  }

  private assembleModelSource(repository: RepositoryType, paramsName: string) {
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

  private getPathName(url: string) {
    const { pathname } = parse(url);
    return pathname;
  }

  private getAbstractFunction(method: string, module: string, url: string) {
    const { pathname } = parse(url);
    const pathnameArr = pathname.split("/");
    return (
      firstToUpper(method) +
      fristToUpperCase(`${module}-${pathnameArr[pathnameArr.length - 1]}`)
    );
  }

  private getNames(method: string, module: string) {
    return {
      entity: fristToUpperCase(`${method}-${module}-entity`),
      params: fristToUpperCase(`${method}-${module}-params`),
      model: fristToUpperCase(`${method}-${module}-model`),
    };
  }

  async start() {
    for (const domain of this.options.domains) {
      const entityTypeList = [];
      const modelTypeList = [];
      let functionList: EntityTemplateType["functionList"] = [];
      const { module, repositorys } = domain;
      const baseModulePath = `${this.basePath}/domain/${module}`;
      for (const repository of repositorys) {
        const { method } = repository;
        const { entity, params } = this.getNames(method, module);
        const result = await this.getRepositoryResponse(repository);
        entityTypeList.push(
          this.json2ts.convert(JSON.stringify(result), entity)
        );
        const abstractFunction = this.getAbstractFunction(
          method,
          module,
          repository.url
        );
        functionList.push({
          abstractFunction,
          params,
          return: entity,
          requestUrl: this.getPathName(repository.url),
        });
        modelTypeList.push(this.assembleModelSource(repository, params));
      }
      await generateFile(
        `${baseModulePath}/model/`,
        `${module}Entity.ts`,
        entityTemplate({
          entity: firstToUpper(module),
          functionList,
          entityTypeList,
        })
      );
      await generateFile(
        `${baseModulePath}/model/`,
        `${module}Model.ts`,
        modelTemplate({
          modelTypeList,
        })
      );
      await generateFile(
        `${baseModulePath}/repository/`,
        `${module}Repository.ts`,
        repositoryTemplate({
          name: firstToUpper(module),
          functionList: functionList,
        })
      );
    }
  }
}

new CodeGenerate({
  domains: [
    {
      module: "admin",
      repositorys: [
        {
          url: "http://127.0.0.1:8889/admin/adminLogin",
          method: "POST",
          body: {
            user_name: "admin",
            password: "123456",
          },
        },
      ],
    },
  ],
}).start();
