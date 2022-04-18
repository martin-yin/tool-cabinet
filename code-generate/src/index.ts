import axios, { Method } from "axios";
import fs from "fs";
import path from "path";
import parse from "url-parse";
import { Json2Ts } from "./utils/json2ts";
import { entityTemplate } from "./utils/template/entityTemplate";
import {
  CodeGenerateOptionsType,
  EntityTemplateType,
  RepositoryTemplateFunctionType,
  RepositoryType,
} from "./interface";
import { generateFile } from "./utils/file";
import { repositoryTemplate } from "./utils/template/repositoryTemplate";
import { modelTemplate } from "./utils/template/modelTemplate";
import { firstToUpper, fristToUpperCase } from "./utils";

class CodeGenerate {
  public options: CodeGenerateOptionsType;
  private json2ts: Json2Ts;
  private basePath: string;

  /**
   * 初始化
   * @param options
   */
  constructor(options: CodeGenerateOptionsType) {
    this.options = options;
    this.json2ts = new Json2Ts();
    this.basePath = path.join(__dirname);
  }

  /**
   * 发送请求
   * @param repository
   * @returns
   */
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

  /**
   * 组装Model
   * @param repository
   * @param paramsName
   * @returns
   */
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

  /**
   * 获取请求地址
   * @param url
   * @returns
   */
  private getPathName(url: string) {
    const { pathname } = parse(url);
    return pathname;
  }

  /**
   * 获取抽象类名称
   * @param method
   * @param module
   * @param url
   * @returns
   */
  private getAbstractFunc(method: string, module: string, url: string) {
    const { pathname } = parse(url);
    const pathnameArr = pathname.split("/");
    return (
      firstToUpper(method) +
      fristToUpperCase(`${module}-${pathnameArr[pathnameArr.length - 1]}`)
    );
  }

  /**
   * 获取名称
   * @param method
   * @param module
   * @param url
   * @returns
   */
  private getNames(method: string, module: string, url: string) {
    return {
      entity: fristToUpperCase(`${method}-${module}-entity`),
      params: fristToUpperCase(`${method}-${module}-params`),
      model: fristToUpperCase(`${method}-${module}-model`),
      abstractFunc: this.getAbstractFunc(method, module, url),
    };
  }

  /**
   * 生成文件
   * @param baseModulePath
   * @param module
   * @param entityTypeList
   * @param modelTypeList
   * @param functionList
   */
  private async writeModelFiles(
    baseModulePath: string,
    module: string,
    entityTypeList: string[],
    modelTypeList: string[],
    functionList: EntityTemplateType["functionList"]
  ) {
    const modelFile = `${baseModulePath}/model`;
    const repository = `${baseModulePath}/repository`;

    const entityTemplateWrite = await generateFile(
      modelFile,
      `${module}Entity.ts`,
      entityTemplate({
        entity: firstToUpper(module),
        functionList,
        entityTypeList,
      })
    );

    if (entityTemplateWrite) {
      // 创建 model
      const modelTemplateWrite = await generateFile(
        modelFile,
        `${module}Model.ts`,
        modelTemplate({
          modelTypeList,
        })
      );
      if (modelTemplateWrite) {
        // 创建 repository
        await generateFile(
          repository,
          `${module}Repository.ts`,
          repositoryTemplate({
            name: firstToUpper(module),
            functionList: functionList,
          })
        );
      }
    }
  }

  /**
   * 添加函数
   * @param functionList
   * @param data
   */
  private addFunction(
    functionList: EntityTemplateType["functionList"],
    data: RepositoryTemplateFunctionType
  ) {
    functionList.push(data);
  }

  /**
   * start
   */
  async start() {
    for (const domain of this.options.domains) {
      const entityTypeList = [];
      const modelTypeList = [];
      let functionList: EntityTemplateType["functionList"] = [];
      const { module, repositorys } = domain;
      const baseModulePath = `${this.basePath}/domain/${module}`;
      for (const repository of repositorys) {
        const { method } = repository;
        const { entity, params, abstractFunc } = this.getNames(
          method,
          module,
          repository.url
        );
        // 发送请求
        const result = await this.getRepositoryResponse(repository);
        // 请求完成后生成 ts 类型。
        entityTypeList.push(
          this.json2ts.convert(JSON.stringify(result), entity)
        );

        modelTypeList.push(this.assembleModelSource(repository, params));

        this.addFunction(functionList, {
          abstractFunc: abstractFunc,
          params,
          return: entity,
          requestUrl: this.getPathName(repository.url),
        });
      }
      // 写入文件
      this.writeModelFiles(
        baseModulePath,
        module,
        entityTypeList,
        modelTypeList,
        functionList
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
