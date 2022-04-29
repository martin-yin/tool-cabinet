'use strict';

var cac = require('cac');
var fs = require('fs');
var path = require('path');
var colors = require('picocolors');
var _ = require('underscore');
var axios = require('axios');
var parse = require('url-parse');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    for (var k in e) {
      n[k] = e[k];
    }
  }
  n["default"] = e;
  return n;
}

var cac__default = /*#__PURE__*/_interopDefaultLegacy(cac);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var colors__default = /*#__PURE__*/_interopDefaultLegacy(colors);
var ___namespace = /*#__PURE__*/_interopNamespace(_);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var parse__default = /*#__PURE__*/_interopDefaultLegacy(parse);

const entityTemplate = ({ entityTypeContent, abstractClassName, abstractFuncList }) => {
  return `
    import { IResponse } from '@/infrastructure/lib/request'
    
    export abstract class ${abstractClassName} {
      ${abstractFuncList.map((item) => {
    return `abstract ${item.funcName}(${item.paramsType !== "" ? "params: " + item.paramsType : ""}): Promise<IResponse<${item.returnType}>>`;
  }).join("\n")}
    }

    ${entityTypeContent.join("\n")}
`;
};

const modelTemplate = ({ modelTypeContent }) => {
  return `
  ${modelTypeContent.join("\n")}
`;
};

const repositoryTemplate = ({ className, abstractClassName, funcList }) => {
  return `
  import { HttpService } from '@/infrastructure/interface/http'
  import { IResponse } from '@/infrastructure/lib/request'
  import { inject, injectable } from 'tsyringe'
 
  
  @injectable()
  export class ${className} implements ${abstractClassName} {
    constructor(@inject('HttpService') private webHttpService: HttpService) {}

    ${funcList.map((item) => {
    return `
      async ${item.funcName}(${item.paramsType !== "" ? "params: " + item.paramsType : ""}): Promise<IResponse<${item.returnType}>> {
        return await this.webHttpService.${item.method}('${item.requestUrl}' ${item.paramsType !== "" ? ",params" : ""})
      }
      `;
  }).join("\n")}
    }
`;
};

const useCaseTemplate = (usecase) => {
  return `
  import { MessageService } from '@/infrastructure/interface/message'
  import { UseCase } from '@/infrastructure/interface/use.case'
  import { inject, injectable } from 'tsyringe'

  @injectable()
  export class ${usecase.classeName} implements UseCase<${usecase.paramsType}, ${usecase.paramsType}> {
    constructor(
      @inject('${usecase.abstractClassType}') private ${usecase.abstractClass}: ${usecase.abstractClassType},
      @inject('MessageService') private messageService: MessageService,
    ) {}
    async execute(${usecase.paramsType === "void" ? "" : "params:" + usecase.paramsType}): Promise<${usecase.paramsType}> {
      const { data, code, msg } = await this.${usecase.abstractClass}.${usecase.funcName}${usecase.paramsType === "void" ? "" : "(params)"}
      if (code === 200) {
        return data
      } else {
        this.messageService.error(msg)
        return null
      }
    }
  }
`;
};

class Json2Ts {
  convert(content, name) {
    let jsonContent = JSON.parse(content);
    if (___namespace.isArray(jsonContent)) {
      return this.convertObjectToTsInterfaces(jsonContent[0], name);
    }
    return this.convertObjectToTsInterfaces(jsonContent, name);
  }
  convertObjectToTsInterfaces(jsonContent, objectName = "RootObject") {
    let optionalKeys = [];
    let objectResult = [];
    for (let key in jsonContent) {
      let value = jsonContent[key];
      if (___namespace.isObject(value) && !___namespace.isArray(value)) {
        let childObjectName = this.toUpperFirstLetter(key);
        objectResult.push(this.convertObjectToTsInterfaces(value, childObjectName));
        jsonContent[key] = childObjectName + ";";
      } else if (___namespace.isArray(value)) {
        let arrayTypes = this.detectMultiArrayTypes(value);
        if (this.isMultiArray(arrayTypes)) {
          let multiArrayBrackets = this.getMultiArrayBrackets(value);
          if (this.isAllEqual(arrayTypes)) {
            jsonContent[key] = arrayTypes[0].replace("[]", multiArrayBrackets);
          } else {
            jsonContent[key] = "any" + multiArrayBrackets + ";";
          }
        } else if (value.length > 0 && ___namespace.isObject(value[0])) {
          let childObjectName = this.toUpperFirstLetter(key);
          objectResult.push(this.convertObjectToTsInterfaces(value[0], childObjectName));
          jsonContent[key] = childObjectName + "[];";
        } else {
          jsonContent[key] = arrayTypes[0];
        }
      } else if (___namespace.isDate(value)) {
        jsonContent[key] = "Date;";
      } else if (___namespace.isString(value)) {
        jsonContent[key] = "string;";
      } else if (___namespace.isBoolean(value)) {
        jsonContent[key] = "boolean;";
      } else if (___namespace.isNumber(value)) {
        jsonContent[key] = "number;";
      } else {
        jsonContent[key] = "any;";
        optionalKeys.push(key);
      }
    }
    let result = this.formatCharsToTypeScript(jsonContent, objectName, optionalKeys);
    objectResult.push(result);
    return objectResult.join("\n\n");
  }
  detectMultiArrayTypes(value, valueType = []) {
    if (___namespace.isArray(value)) {
      if (value.length === 0) {
        valueType.push("any[];");
      } else if (___namespace.isArray(value[0])) {
        for (let index = 0, length = value.length; index < length; index++) {
          let element = value[index];
          let valueTypeResult = this.detectMultiArrayTypes(element, valueType);
          valueType.concat(valueTypeResult);
        }
      } else if (___namespace.all(value, ___namespace.isString)) {
        valueType.push("string[];");
      } else if (___namespace.all(value, ___namespace.isNumber)) {
        valueType.push("number[];");
      } else if (___namespace.all(value, ___namespace.isBoolean)) {
        valueType.push("boolean[];");
      } else {
        valueType.push("any[];");
      }
    }
    return valueType;
  }
  isMultiArray(arrayTypes) {
    return arrayTypes.length > 1;
  }
  isAllEqual(array) {
    return ___namespace.all(array.slice(1), ___namespace.partial(___namespace.isEqual, array[0]));
  }
  getMultiArrayBrackets(content) {
    let jsonString = JSON.stringify(content);
    let brackets = "";
    for (let index = 0, length = jsonString.length; index < length; index++) {
      let element = jsonString[index];
      if (element === "[") {
        brackets = brackets + "[]";
      } else {
        index = length;
      }
    }
    return brackets;
  }
  formatCharsToTypeScript(jsonContent, objectName, optionalKeys) {
    let result = JSON.stringify(jsonContent, null, "	").replace(new RegExp('"', "g"), "").replace(new RegExp(",", "g"), "");
    let allKeys = ___namespace.allKeys(jsonContent);
    for (let index = 0, length = allKeys.length; index < length; index++) {
      let key = allKeys[index];
      if (___namespace.contains(optionalKeys, key)) {
        result = result.replace(new RegExp(key + ":", "g"), this.toLowerFirstLetter(key) + "?:");
      } else {
        result = result.replace(new RegExp(key + ":", "g"), this.toLowerFirstLetter(key) + ":");
      }
    }
    return "export interface " + objectName + " " + result;
  }
  toUpperFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  toLowerFirstLetter(text) {
    return text.charAt(0).toLowerCase() + text.slice(1);
  }
  isJson(stringContent) {
    try {
      JSON.parse(stringContent);
    } catch (e) {
      return false;
    }
    return true;
  }
}

function toUpperCaseBySymbol(str, symbol = "-") {
  const newStr = str.trim().toLowerCase();
  return newStr.split(symbol).map((value) => firstToUpper(value)).join("");
}
function firstToUpper(str) {
  return str.trim().replace(str[0], str[0].toUpperCase());
}
function toLower(str) {
  return str.toLowerCase();
}
function firstToLower(str) {
  return str.trim().replace(str[0], str[0].toLowerCase());
}
function getNames(module, repository) {
  const { method, url } = repository;
  const last = getUrlLast(url);
  return {
    method: toLower(method),
    entityType: toUpperCaseBySymbol(`${method}-${module}-entity`),
    paramsType: toUpperCaseBySymbol(`${method}-${module}-${last}-params`),
    modelName: toUpperCaseBySymbol(`${method}-${module}-model`),
    funcName: getFuncName(method, module, last)
  };
}
function getFuncName(method, module, last) {
  let api = "";
  const fristUpperMethod = toLower(method);
  if (last === module) {
    api = firstToUpper(`${module}`);
  } else {
    api = toUpperCaseBySymbol(`${module}-${last}`);
  }
  return `${fristUpperMethod}${api}`;
}
function getUrlLast(url) {
  const { pathname } = parse__default(url);
  const pathnameArr = pathname.split("/");
  const last = pathnameArr[pathnameArr.length - 1];
  return last;
}
function getPathName(url) {
  const { pathname } = parse__default(url);
  return pathname;
}
async function repositoryRequest(config) {
  try {
    const result = await axios__default.request(config);
    if (result.status == 200) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.log(colors__default.red(`\u5931\u8D25\u539F\u56E0\uFF1A${error.toString()} 
`));
    return null;
  }
}
function transformType(data, typeName) {
  const json2ts = new Json2Ts();
  return json2ts.convert(data, typeName);
}
const template = {
  entity: entityTemplate,
  model: modelTemplate,
  repository: repositoryTemplate,
  useCase: useCaseTemplate
};
const getTemplate = new Proxy(template, {
  get(target, phrase) {
    if (phrase in target) {
      return Reflect.get(target, phrase);
    } else {
      console.log(colors__default.red(`\u6CA1\u6709\u67E5\u8BE2\u5230${phrase}Template \u6A21\u677F
`));
      return null;
    }
  }
});

class EntitySourceCode {
  constructor(modulePath, module) {
    this.entityTypeContent = [];
    this.abstractFuncList = [];
    this.modulePath = `${modulePath}/model/`;
    this.module = module;
  }
  pushEntity({ entityTypeContent, entityType, funcName, paramsType }) {
    this.entityTypeContent.push(entityTypeContent);
    this.abstractClassName = `${firstToUpper(this.module)}Repository`;
    this.abstractFuncList.push({
      funcName,
      paramsType,
      returnType: entityType
    });
  }
  getEntity() {
    return {
      filePath: `${this.modulePath}`,
      fileName: `${this.module}Entity.ts`,
      template: "entity",
      code: {
        entityTypeContent: this.entityTypeContent,
        abstractClassName: this.abstractClassName,
        abstractFuncList: this.abstractFuncList
      }
    };
  }
}

class ModelSourceCode {
  constructor(modulePath, module) {
    this.modelTypeContent = [];
    this.modulePath = `${modulePath}/model/`;
    this.module = module;
  }
  pushModel(repository, paramsType) {
    this.modelTypeContent.push(this.transformModelContent(repository, paramsType));
  }
  transformModelContent(repository, paramsType) {
    let modelTypeContent = "";
    if (repository == null ? void 0 : repository.params) {
      modelTypeContent = transformType(JSON.stringify(repository.params), paramsType);
    }
    if (repository == null ? void 0 : repository.body) {
      modelTypeContent = transformType(JSON.stringify(repository.body), paramsType);
    }
    return modelTypeContent;
  }
  getModel() {
    return {
      filePath: this.modulePath,
      fileName: `${this.module}Model.ts`,
      template: "model",
      code: {
        modelTypeContent: this.modelTypeContent
      }
    };
  }
}

class RepositorySourceCode {
  constructor(modulePath, module) {
    this.funcList = [];
    this.className = `${firstToUpper(module)}WebRepository`;
    this.abstractClassName = `${firstToUpper(module)}Repository`;
    this.modulePath = `${modulePath}/repository/`;
    this.module = module;
  }
  pushRepositoryFunc(data) {
    this.funcList.push({
      method: data.method,
      paramsType: data.paramsType,
      funcName: data.funcName,
      returnType: data.entityType,
      requestUrl: getPathName(data.repository.url)
    });
  }
  getRepository() {
    return {
      filePath: this.modulePath,
      fileName: `${this.module}Repository.ts`,
      template: "repository",
      code: {
        className: this.className,
        abstractClassName: this.abstractClassName,
        funcList: this.funcList
      }
    };
  }
}

class UseCaseSourceCode {
  constructor(modulePath, module) {
    this.useCaseCode = [];
    this.modulePath = `${modulePath}/application/`;
    this.module = module;
  }
  pushUseCase(funcName, paramsType, entityType) {
    const classeName = firstToUpper(funcName) + "Usecase";
    this.useCaseCode.push({
      fileName: `${firstToLower(classeName)}.ts`,
      classeName,
      paramsType,
      returnType: entityType,
      abstractClass: this.module + "Repository",
      abstractClassType: firstToUpper(this.module) + "Repository",
      funcName
    });
  }
  getUseCaseMap() {
    return this.useCaseCode.map((item) => {
      return {
        filePath: this.modulePath,
        template: "useCase",
        fileName: item.fileName,
        code: item
      };
    });
  }
}

class SourceCode {
  constructor() {
    this.sourceCodeList = [];
  }
  async transformSourceCode(modulePath, domain) {
    const { module, repositorys } = domain;
    this.entitySourceCode = new EntitySourceCode(modulePath, module);
    this.modelSourceCode = new ModelSourceCode(modulePath, module);
    this.repositorySourceCode = new RepositorySourceCode(modulePath, module);
    this.useCaseSourceCode = new UseCaseSourceCode(modulePath, module);
    for (const repository of repositorys) {
      const result = await repositoryRequest(repository);
      const { entityType, paramsType, funcName, method } = getNames(module, repository);
      if (result && _.isObject(result)) {
        const entityTypeContent = transformType(JSON.stringify(result), entityType);
        this.pushSourceCodes({ entityType, entityTypeContent, module, funcName, paramsType, repository, method });
      } else {
        throw Error(`${repository.url} \u8BF7\u6C42\u5931\u8D25 \u6216 \u8BF7\u6C42\u8FD4\u56DE\u7684\u6570\u636E\u4E0D\u662F\u5BF9\u8C61`);
      }
    }
    this.combinationSourceCode();
  }
  combinationSourceCode() {
    this.sourceCodeList.push(...[
      this.entitySourceCode.getEntity(),
      this.modelSourceCode.getModel(),
      this.repositorySourceCode.getRepository(),
      ...this.useCaseSourceCode.getUseCaseMap()
    ]);
  }
  pushSourceCodes(sourceCodes) {
    const { entityType, entityTypeContent, funcName, paramsType, repository, method } = sourceCodes;
    this.entitySourceCode.pushEntity({
      entityTypeContent,
      entityType,
      funcName,
      paramsType
    });
    this.modelSourceCode.pushModel(repository, paramsType);
    this.repositorySourceCode.pushRepositoryFunc({ method, paramsType, funcName, entityType, repository });
    this.useCaseSourceCode.pushUseCase(funcName, paramsType, entityType);
  }
}

async function dotExistDirectoryCreate(directory) {
  const { dir } = path__default.parse(directory);
  if (_.isEmpty(dir)) {
    console.log("\u8DEF\u5F84\u4E0D\u80FD\u4E3A\u7A7A");
    return false;
  }
  if (fs__default.existsSync(directory)) {
    return true;
  }
  fs__default.mkdirSync(directory, { recursive: true });
  return true;
}
async function generateFile(directory, file, data) {
  if (fs__default.existsSync(`${directory}/${file}`)) {
    console.log(colors__default.red(`\u521B\u5EFA\u6587\u4EF6\u5931\u8D25\uFF0C${file}\u6587\u4EF6\u5DF2\u7ECF\u5B58\u5728 
`));
    return false;
  }
  if (await dotExistDirectoryCreate(directory)) {
    console.log(colors__default.blue(`\u6B63\u5728\u521B\u5EFA\u521B\u5EFA\u6587\u4EF6: ${directory}${file} 
`));
    try {
      fs__default.writeFileSync(`${directory}/${file}`, data, "utf8");
      console.log(colors__default.green(`\u521B\u5EFA\u521B\u5EFA\u6587\u4EF6\u6210\u529F: ${file} 
`));
      return true;
    } catch (error) {
      console.log(colors__default.red(`\u521B\u5EFA\u6587\u4EF6\u5931\u8D25, ${error.message} 
`));
      return false;
    }
  }
}

class WriteFile {
  async writeFiles(sourceCodeList) {
    console.log(colors__default.blue(`
\u5F00\u59CB\u521B\u5EFA\u6587\u4EF6...
`));
    const writeFilePromises = sourceCodeList.map(async (item) => {
      return this.sourceCodeFileWrite(item);
    });
    const result = await Promise.all(writeFilePromises).catch((error) => {
      console.log(colors__default.red(`\u5931\u8D25\u539F\u56E0\uFF1A${error} 
`));
    });
    if (result[0]) {
      return true;
    }
    return false;
  }
  async sourceCodeFileWrite(sourceCode) {
    const { fileName, filePath, template, code } = sourceCode;
    const templateWrite = getTemplate[template];
    if (templateWrite) {
      return generateFile(filePath, fileName, templateWrite(code));
    }
    return false;
  }
}

class GenerateRequestCode {
  constructor(options) {
    this.options = options;
    this.sourceCode = new SourceCode();
    this.writeFile = new WriteFile();
  }
  async run() {
    const {
      options: { filePath, domains }
    } = this;
    for (const domain of domains) {
      const { module } = domain;
      const modulePath = `${filePath}/domain/${module}`;
      await this.sourceCode.transformSourceCode(modulePath, domain);
      const sourceCodeList = this.sourceCode.sourceCodeList;
      const result = await this.writeFile.writeFiles(sourceCodeList);
      if (result) {
        console.log(colors__default.green(`\u6A21\u5757${module}\u5199\u5165\u5B8C\u6210!
`));
      } else {
        throw Error(`\u6A21\u5757${module}\u5199\u5165\u5931\u8D25!
`);
      }
    }
  }
}

const rootPath = process.cwd();
function cliInit() {
  const cli = cac__default("generate-request-code");
  cli.option("--config", "config path");
  return cli.parse();
}
function start() {
  const { args } = cliInit();
  const configPath = path__default.resolve(rootPath, args[0]);
  try {
    const configJson = fs__default.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configJson);
    if (config.filePath == "") {
      throw new Error("\u914D\u7F6E\u6587\u4EF6\u5730\u5740\u4E0D\u80FD\u4E3A\u7A7A");
    }
    const generateRequestCode = new GenerateRequestCode(config);
    generateRequestCode.run();
  } catch (error) {
    throw new Error(`\u8BFB\u53D6\u914D\u7F6E\u6587\u4EF6\u9519\u8BEF: ${error.message}`);
  }
}
start();
