'use strict';

var cac = require('cac');
var esbuild = require('esbuild');
var fs = require('fs');
var path = require('path');
var url = require('url');
var colors = require('picocolors');
var _ = require('underscore');
var parse = require('url-parse');
var axios = require('axios');
var tsMorph = require('ts-morph');

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
var parse__default = /*#__PURE__*/_interopDefaultLegacy(parse);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);

var version = "0.0.2";

async function loadTsyringeInjectConfig(configFile) {
  const config = await loadConfigFromFile("tsyringe-inject-code", configFile);
  return config;
}
async function loadGenerateRepositoryCodeConfig(configFile) {
  const config = await loadConfigFromFile("generate-repository-code", configFile);
  return config;
}
async function loadConfigFromFile(configName, configFile) {
  const { resolvedPath, isTS } = getConfigResolvePath(configName, configFile);
  try {
    let userConfig;
    const fileUrl = url.pathToFileURL(resolvedPath);
    if (isTS) {
      userConfig = await readBundleConfig(resolvedPath);
    } else {
      userConfig = (await require(`${fileUrl}`)).default;
    }
    return userConfig;
  } catch (e) {
    console.log(e);
    return null;
  }
}
async function readBundleConfig(resolvedPath) {
  const bundled = await bundleConfigFile(resolvedPath, false);
  fs__default.writeFileSync(resolvedPath + ".js", bundled.code);
  const userConfig = (await require(`${resolvedPath}.js`)).default;
  fs__default.unlinkSync(resolvedPath + ".js");
  return userConfig;
}
function getConfigResolvePath(configName, configFile, configRoot = process.cwd()) {
  let resolvedPath;
  let isTS = false;
  if (configFile) {
    resolvedPath = path__default.resolve(configFile);
    isTS = configFile.endsWith(".ts");
  } else {
    if (!resolvedPath) {
      const jsconfigFile = path__default.resolve(configRoot, `${configName}.js`);
      if (fs__default.existsSync(jsconfigFile)) {
        resolvedPath = jsconfigFile;
      }
    }
    if (!resolvedPath) {
      const tsconfigFile = path__default.resolve(configRoot, `${configName}.ts`);
      if (fs__default.existsSync(tsconfigFile)) {
        resolvedPath = tsconfigFile;
        isTS = true;
      }
    }
  }
  if (!resolvedPath) {
    throw Error(`\u6CA1\u6709\u67E5\u8BE2\u5230 ${configName} \u914D\u7F6E\u6587\u4EF6\uFF01`);
  }
  return { isTS, resolvedPath };
}
async function bundleConfigFile(fileName, isESM = false) {
  const result = await esbuild.build({
    absWorkingDir: process.cwd(),
    entryPoints: [fileName],
    outfile: "out.js",
    write: false,
    platform: "node",
    bundle: true,
    format: isESM ? "esm" : "cjs",
    sourcemap: "inline",
    metafile: true,
    plugins: [
      {
        name: "externalize-deps",
        setup(build2) {
          build2.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path;
            if (id[0] !== "." && !path__default.isAbsolute(id)) {
              return {
                external: true
              };
            }
          });
        }
      },
      {
        name: "replace-import-meta",
        setup(build2) {
          build2.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
            const contents = await fs__default.promises.readFile(args.path, "utf8");
            return {
              loader: args.path.endsWith(".ts") ? "ts" : "js",
              contents: contents.replace(/\bimport\.meta\.url\b/g, JSON.stringify(url.pathToFileURL(args.path).href)).replace(/\b__dirname\b/g, JSON.stringify(path__default.dirname(args.path))).replace(/\b__filename\b/g, JSON.stringify(args.path))
            };
          });
        }
      }
    ]
  });
  const { text } = result.outputFiles[0];
  return {
    code: text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : []
  };
}

class ContainerRepository {
  constructor() {
    this.containerMap = /* @__PURE__ */ new Map();
  }
  getRepository(module) {
    const repositorys = this.containerMap.get(module);
    if (repositorys === void 0) {
      throw new Error(`\u6CA1\u6709\u67E5\u8BE2\u5230${module}repositorys`);
    }
    return repositorys;
  }
  registerRepository(module, repositorys) {
    this.containerMap.set(module, repositorys);
  }
}

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
function isEmpty(str) {
  return str.trim() === "";
}
function getNames(module, repository) {
  const { method, url } = repository;
  const last = getUrlLast(url);
  return {
    method: getMethod(method),
    entityType: getEntityType(method, module),
    paramsType: repository.params || repository.data ? getParamsType(method, module, last) : "",
    modelName: getModelName(method, module),
    funcName: getFuncName(method, module, last)
  };
}
function getModelName(method, module) {
  const modelName = `${method}-${module}-model`;
  return toUpperCaseBySymbol(modelName);
}
function getEntityType(method, module) {
  const entityType = `${method}-${module}-entity`;
  return toUpperCaseBySymbol(entityType);
}
function getMethod(method) {
  return toLower(method);
}
function getParamsType(method, module, last) {
  const paramsType = isEmpty(last) ? `${method}-${module}-by-id-params` : module === last ? `${method}-${module}-params` : `${method}-${module}-${last}-params`;
  return toUpperCaseBySymbol(paramsType);
}
function getFuncName(method, module, last) {
  let api = "";
  if (last === module) {
    api = firstToUpper(`${module}`);
  } else {
    const apiName = isEmpty(last) ? `${module}-by-id` : `${module}-${last}`;
    api = toUpperCaseBySymbol(apiName);
  }
  return `${toLower(method)}${api}`;
}
function getUrlLast(url) {
  const { pathname } = parse__default(url);
  const last = pathname.split("/").pop();
  return isNaN(parseInt(last)) ? last : "";
}
function getPathName(url) {
  const { pathname } = parse__default(url);
  return pathname;
}
function convertType(data, typeName) {
  const json2ts = new Json2Ts();
  return json2ts.convert(data, typeName);
}

function getEntity(module, method, result) {
  let entityTypeContent = "";
  let entityType = getEntityType(method, module);
  entityTypeContent += convertType(JSON.stringify(result), entityType);
  if (Array.isArray(result)) {
    entityTypeContent += `
 export type ${entityType}List = ${entityType}[]`;
    entityType = `${entityType}List`;
  }
  return { entityTypeContent, entityType };
}
const entityTemplate = {
  type: "template",
  name: "entity",
  transform: (module, containerRepository) => {
    const repositorys = containerRepository.getRepository(module);
    const entityTypeContentList = [];
    const funcList = [];
    repositorys.map((repository) => {
      const { entityTypeContent, entityType } = getEntity(module, repository.method, repository.result);
      const { paramsType, funcName } = getNames(module, repository);
      entityTypeContentList.push(entityTypeContent);
      funcList.push({
        funcName,
        paramsType,
        returnType: entityType
      });
      repository.templateData = {
        funcName,
        paramsType,
        returnType: entityType
      };
    });
    containerRepository.registerRepository(module, repositorys);
    return {
      directory: `/domain/${module}/model/`,
      fileName: `${module}Entity.ts`,
      className: `${firstToUpper(module)}Repository`,
      funcList,
      entityTypeContent: entityTypeContentList
    };
  },
  template: ({ directory, fileName, className, funcList, entityTypeContent }) => {
    return {
      directory,
      fileName,
      content: `
          import { IResponse } from '@/infrastructure/lib/request'
          export abstract class ${className} {
            ${funcList.map((item) => {
        return `abstract ${item.funcName}(${item.paramsType !== "" ? "params: " + item.paramsType : ""}): Promise<IResponse<${item.returnType}>>`;
      }).join("\n")}
          }
          ${entityTypeContent.join("\n")}
        `
    };
  }
};

function covertModelContent(repository, paramsType) {
  let modelTypeContent = "";
  if (repository == null ? void 0 : repository.params) {
    modelTypeContent = convertType(JSON.stringify(repository.params), paramsType);
  }
  if (repository == null ? void 0 : repository.data) {
    modelTypeContent = convertType(JSON.stringify(repository.data), paramsType);
  }
  return modelTypeContent;
}
const modelTemplate = {
  type: "template",
  name: "model",
  transform: (module, containerRepository) => {
    const modelTypeContent = [];
    const repositorys = containerRepository.getRepository(module);
    repositorys.map((repository) => {
      modelTypeContent.push(covertModelContent(repository, repository.templateData.paramsType));
    });
    return {
      directory: `/domain/${module}/model/`,
      fileName: `${module}Model.ts`,
      modelTypeContent
    };
  },
  template: ({ directory, fileName, modelTypeContent }) => {
    return {
      directory,
      fileName,
      content: `
        ${modelTypeContent.join("\n")}
      `
    };
  }
};

const repositoryTemplate = {
  type: "template",
  name: "repository",
  transform: (module, containerRepository) => {
    const repositorys = containerRepository.getRepository(module);
    const funcList = [];
    repositorys.map((repository) => {
      funcList.push({
        method: repository.method,
        paramsType: repository.templateData.paramsType,
        funcName: repository.templateData.funcName,
        returnType: repository.templateData.returnType,
        requestUrl: getPathName(repository.url)
      });
    });
    return {
      directory: `/domain/${module}/repository/`,
      fileName: `${module}Repository.ts`,
      className: `${firstToUpper(module)}WebRepository`,
      abstractClassName: `${firstToUpper(module)}Repository`,
      funcList
    };
  },
  template: ({ directory, fileName, className, abstractClassName, funcList }) => {
    return {
      directory,
      fileName,
      content: `
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
      `
    };
  }
};

const useCaseTemplate = {
  type: "template",
  name: "usecase",
  transform: (module, containerRepository) => {
    const repositorys = containerRepository.getRepository(module);
    const useCaseList = [];
    repositorys.map((repository) => {
      const { funcName, paramsType, returnType } = repository.templateData;
      const classeName = firstToUpper(funcName) + "Usecase";
      useCaseList.push({
        directory: `/domain/${module}/application/`,
        fileName: `${firstToLower(classeName)}.ts`,
        classeName,
        paramsType,
        returnType,
        abstractClass: `${module}Repository`,
        abstractClassType: firstToUpper(module) + "Repository",
        funcName
      });
    });
    return useCaseList;
  },
  template: ({
    directory,
    fileName,
    classeName,
    abstractClass,
    paramsType,
    returnType,
    funcName,
    abstractClassType
  }) => {
    return {
      directory,
      fileName,
      content: `
        import { MessageService } from '@/infrastructure/interface/message'
        import { UseCase } from '@/infrastructure/interface/use.case'
        import { inject, injectable } from 'tsyringe'
        @injectable()
        export class ${classeName} implements UseCase<${paramsType === "" ? "void" : paramsType}, ${returnType}> {
          constructor(
            @inject('${abstractClassType}') private ${abstractClass}: ${abstractClassType},
            @inject('MessageService') private messageService: MessageService,
          ) {}
          async execute(${paramsType === "" ? "" : "params:" + paramsType}): Promise<${returnType}> {
            const { data, code, msg } = await this.${abstractClass}.${funcName}${paramsType === "" ? "()" : "(params)"}
            if (code === 200) {
              return data
            } else {
              this.messageService.error(msg)
              return null
            }
          }
        }
      `
    };
  }
};

const defaultTemplatePluginsKey = ["entity", "model", "repository", "useCase"];
const templatePlugins = {
  entity: entityTemplate,
  model: modelTemplate,
  repository: repositoryTemplate,
  useCase: useCaseTemplate
};
const getTemplatePluginByKey = new Proxy(templatePlugins, {
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
class ContainerPlugin {
  constructor(plugins) {
    this.templatePlugins = [];
    this.templatePlugins = this.mergeTemplatePlugins(plugins);
  }
  sortPlugins(plugins, templateOrder) {
    plugins.sort((a) => {
      return templateOrder.indexOf(a.type) - templateOrder.indexOf(a.type);
    });
    return plugins;
  }
  differencePlugins(keysOne, keysTwo) {
    return Array.from(new Set(keysOne.concat(keysTwo).filter((v) => !new Set(keysOne).has(v) || !new Set(keysTwo).has(v))));
  }
  mergeTemplatePlugins(plugins = []) {
    if (plugins.length > 0) {
      const templatePluginKeys = plugins.map((item) => {
        if (item.type == "template") {
          return item.name;
        }
      });
      this.differencePlugins(templatePluginKeys, defaultTemplatePluginsKey).map((item) => {
        plugins.push(getTemplatePluginByKey[item]);
      });
      this.templatePlugins = this.sortPlugins(plugins, defaultTemplatePluginsKey);
    } else {
      defaultTemplatePluginsKey.map((key) => {
        plugins.push(getTemplatePluginByKey[key]);
      });
    }
    return plugins;
  }
  useTemplatePlugins(module, containerRepository) {
    let templateList = [];
    this.templatePlugins.map((plugin) => {
      const { transform, template } = plugin;
      const result = transform(module, containerRepository);
      if (Array.isArray(result)) {
        result.map((usecase) => {
          templateList.push(template(usecase));
        });
      } else {
        templateList.push(template(result));
      }
    });
    return templateList;
  }
}

class RequestRepository {
  constructor({
    requestConfig,
    interceptorRequest = null,
    interceptorResponse = null
  }) {
    this.service = axios__default.create(requestConfig);
    if (interceptorRequest) {
      this.service.interceptors.request.use((config) => {
        return interceptorRequest(config);
      });
    }
    if (interceptorResponse) {
      this.service.interceptors.response.use((response) => {
        return interceptorResponse(response);
      });
    }
  }
  request(config) {
    return this.service.request(config);
  }
}

class FileUtils {
  static async existDirectoryCreate(directory) {
    const { dir } = path__default.parse(directory);
    if (_.isEmpty(dir)) {
      console.log("\u8DEF\u5F84\u4E0D\u80FD\u4E3A\u7A7A");
      return false;
    }
    if (FileUtils.existFile(directory)) {
      return true;
    }
    return fs__default.mkdirSync(directory, { recursive: true });
  }
  static async generateFile(directory, file, data) {
    if (FileUtils.existFile(`${directory}/${file}`)) {
      console.log(colors__default.red(`\u521B\u5EFA\u6587\u4EF6\u5931\u8D25\uFF0C${directory}\u8DEF\u5F84\u4E0B${file}\u6587\u4EF6\u5DF2\u7ECF\u5B58\u5728 
`));
      return false;
    }
    if (await FileUtils.existDirectoryCreate(directory)) {
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
  static existFile(filePath) {
    return fs__default.existsSync(filePath);
  }
}

class GenerateRepositoryCode {
  constructor(options) {
    this.options = {
      baseFilePath: "",
      domains: []
    };
    this.containerRepository = new ContainerRepository();
    const { requestConfig, interceptorRequest, interceptorResponse, baseFilePath, domains, plugins = [] } = options;
    this.options = {
      domains,
      baseFilePath
    };
    this.containerPlugin = new ContainerPlugin(plugins);
    this.service = new RequestRepository({ requestConfig, interceptorRequest, interceptorResponse });
  }
  async run() {
    const {
      options: { domains, baseFilePath }
    } = this;
    for (const domain of domains) {
      const { repositorys, module } = domain;
      for (const repository of repositorys) {
        const result = await this.service.request(repository);
        if (this.validateResult(repository, result)) {
          repository.result = result;
        }
      }
      this.containerRepository.registerRepository(module, repositorys);
      const templateList = this.containerPlugin.useTemplatePlugins(module, this.containerRepository);
      for (const template of templateList) {
        FileUtils.generateFile(baseFilePath + template.directory, template.fileName, template.content);
      }
      console.log(colors__default.blue(`\u6A21\u5757${module}\u6267\u884C\u7ED3\u675F
`));
    }
  }
  validateResult(repository, result) {
    if (!_.isObject(result)) {
      throw Error(`\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u6C42url: ${repository.url}, repository: ${JSON.stringify(repository)},\u9519\u8BEF\u539F\u56E0: \u8BF7\u6C42\u8FD4\u56DE\u7684\u7ED3\u679C\u4E0D\u662F\u5BF9\u8C61`);
    }
    if (Array.isArray(result)) {
      throw Error(`\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u6C42url: ${repository.url}, repository: ${JSON.stringify(repository)},\u9519\u8BEF\u539F\u56E0: \u8BF7\u6C42\u8FD4\u56DE\u7684\u7ED3\u679C\u4E0D\u662F\u6570\u7EC4`);
    }
    return true;
  }
}

function spaceReplace(value) {
  return value.replace(/\s*/g, "");
}
function deduplicationByClasseName(arr) {
  const obj = {};
  return arr.reduce((item, next) => {
    obj[next.classeName] ? "" : obj[next.classeName] = item.push(next);
    return item;
  }, []);
}
function getNamedImportList(injectClasseList) {
  return injectClasseList.filter((injectClasse) => injectClasse.defaultExport === "").map((injectClasse) => {
    const { alias, classeName } = injectClasse;
    if (alias !== "") {
      return alias;
    }
    return classeName;
  });
}
function getDefaultImport(injectClasseList) {
  const injectClasse = injectClasseList.find((injectClasse2) => injectClasse2.defaultExport !== "");
  if (injectClasse) {
    return injectClasse.defaultExport;
  }
}

class AbstractUtilsClasse {
  static IsAbstract(classes) {
    return classes.isAbstract();
  }
  static GetClasseName(classe) {
    return spaceReplace(classe.getName());
  }
  static GetClasse(sourceFile, abstractName) {
    return sourceFile.getClass(abstractName);
  }
  static GetAbstractClasseList(sourceFileList, ignoreAbstractList = []) {
    const abstractClasseList = [];
    for (const sourceFile of sourceFileList) {
      for (const classe of sourceFile == null ? void 0 : sourceFile.getClasses()) {
        const classeName = AbstractUtilsClasse.GetClasseName(classe);
        if ((classe == null ? void 0 : classe.isAbstract()) && classe.isExported() && !ignoreAbstractList.includes(classeName)) {
          abstractClasseList.push(classe);
        }
      }
    }
    if (abstractClasseList.length > 0) {
      return abstractClasseList;
    } else {
      throw Error("\u6CA1\u6709\u67E5\u8BE2\u5230\u62BD\u8C61\u7C7B");
    }
  }
}

class ReferencedClasse {
  constructor(options) {
    this.injectSourceFileClassMap = /* @__PURE__ */ new Map();
    const { sourceFileList, ignoreAbstractList } = options;
    this.sourceFileList = sourceFileList;
    this.ignoreAbstractList = ignoreAbstractList;
  }
  getInjectSourceFileClassMap() {
    const abstractClasseList = AbstractUtilsClasse.GetAbstractClasseList(this.sourceFileList, this.ignoreAbstractList);
    for (const abstractClasse of abstractClasseList) {
      const referencedClasseMap = this.getReferencedClasseMap(abstractClasse);
      const referencedClasseMapKeys = [...referencedClasseMap.keys()];
      referencedClasseMapKeys.map((key) => {
        const referencedNode = referencedClasseMap.get(key);
        const referencSourceFile = referencedNode.getSourceFile();
        const injectClasseList = this.getInjectClasseList(referencedNode, referencSourceFile, key);
        this.injectSourceFileClassMap.set(referencSourceFile, injectClasseList);
      });
    }
    return this.injectSourceFileClassMap;
  }
  getInjectClasseList(referencedNode, referencSourceFile, abstractClasse) {
    const injectClasseList = [];
    const classeAbstractMap = /* @__PURE__ */ new Map();
    const importAbstractClasse = spaceReplace(referencedNode.getFullText());
    for (const referencClasse of referencSourceFile.getClasses()) {
      const implementAbstractClasse = spaceReplace(referencClasse.getImplements()[0].getFullText());
      if (importAbstractClasse === implementAbstractClasse) {
        const injectClasse = this.getClasseByKeywordAndAssignOfExport(referencClasse, abstractClasse);
        classeAbstractMap.set(spaceReplace(referencClasse.getName()), abstractClasse);
        injectClasseList.push(injectClasse);
      }
    }
    return deduplicationByClasseName([...injectClasseList, ...this.getClasseListByExportDeclaration(referencSourceFile, classeAbstractMap)].reverse());
  }
  getClasseListByExportDeclaration(referencSourceFile, classeAbstractMap) {
    const injectClasseList = [];
    const exportList = referencSourceFile.getChildrenOfKind(tsMorph.SyntaxKind.ExportDeclaration)[0].getChildrenOfKind(tsMorph.SyntaxKind.NamedExports)[0];
    if (exportList) {
      for (const exportItem of exportList.getChildrenOfKind(tsMorph.SyntaxKind.ExportSpecifier)) {
        const [classe, alias] = exportItem.getChildrenOfKind(tsMorph.SyntaxKind.Identifier);
        const exportClasse = spaceReplace(classe.getFullText());
        const classeAbstract = classeAbstractMap.get(exportClasse);
        if (classeAbstract) {
          injectClasseList.push({
            classeName: spaceReplace(classe.getFullText()),
            alias: spaceReplace(alias.getFullText()),
            abstractClasseName: classeAbstract,
            defaultExport: ""
          });
        }
      }
      return injectClasseList;
    }
  }
  getClasseByKeywordAndAssignOfExport(referencClasse, abstractClasseName) {
    const classeName = spaceReplace(referencClasse.getName());
    if (referencClasse.isDefaultExport()) {
      return {
        defaultExport: classeName,
        classeName,
        alias: "",
        abstractClasseName
      };
    }
    if (referencClasse.isExported()) {
      return {
        defaultExport: "",
        classeName,
        alias: "",
        abstractClasseName
      };
    }
  }
  getReferencedClasseMap(classe) {
    const referencedClasseMap = /* @__PURE__ */ new Map();
    try {
      const referencedstractClasseName = AbstractUtilsClasse.GetClasseName(classe);
      const referencedSymbols = classe.findReferences();
      if (referencedSymbols) {
        for (const referencedSymbol of referencedSymbols) {
          for (const reference of referencedSymbol.getReferences()) {
            const referencedNode = reference.getNode();
            const importDeclaration = referencedNode.getFirstAncestorByKind(tsMorph.SyntaxKind.ImportDeclaration);
            if (importDeclaration) {
              referencedClasseMap.set(referencedstractClasseName, referencedNode);
            }
          }
        }
      }
      return referencedClasseMap;
    } catch (e) {
      throw new Error(`\u83B7\u53D6\u62BD\u8C61\u7C7B\u5F15\u7528\u94FE\u5931\u8D25\uFF1A${e.message}`);
    }
  }
}

class TsyringeInject {
  constructor(options) {
    const { ignoreAbstractList = [], mainSourcePath, sourceFilePathList, tsConfigFilePath } = options;
    this.ignoreAbstractList = ignoreAbstractList;
    this.project = new tsMorph.Project({
      tsConfigFilePath
    });
    this.mainSource = this.project.addSourceFileAtPath(mainSourcePath);
    this.sourceFileList = this.project.addSourceFilesAtPaths(sourceFilePathList);
  }
  run() {
    const { sourceFileList, ignoreAbstractList } = this;
    const referencedClasse = new ReferencedClasse({
      sourceFileList,
      ignoreAbstractList
    });
    const injectSourceFileClassMap = referencedClasse.getInjectSourceFileClassMap();
    const { injectContent, importClasseList } = this.assembleInjectContentAndImportClassList(injectSourceFileClassMap);
    this.mainSource.addImportDeclaration({
      namedImports: ["container"],
      moduleSpecifier: "tsyringe"
    });
    const mainSourceImportList = this.mainSource.getImportDeclarations();
    if (mainSourceImportList.length > 0) {
      this.injectAfterLastImport(mainSourceImportList.length, injectContent, importClasseList);
    } else {
      this.mainSource.insertStatements(0, injectContent);
      this.mainSource.addImportDeclarations(importClasseList);
    }
    this.mainSource.save();
  }
  injectAfterLastImport(index, injectContent, importClasseList) {
    const lastImport = this.mainSource.getLastChildByKind(tsMorph.SyntaxKind.ImportDeclaration).getSourceFile();
    this.mainSource.insertStatements(index, injectContent);
    lastImport.addImportDeclarations(importClasseList);
  }
  assembleInjectContentAndImportClassList(injectSourceFileClassMap) {
    let injectContent = `//------ inject start ------`;
    const importClasseList = [];
    injectSourceFileClassMap.forEach((injectClasseList, sourceFile) => {
      importClasseList.push({
        namedImports: getNamedImportList(injectClasseList),
        moduleSpecifier: this.mainSource.getRelativePathAsModuleSpecifierTo(sourceFile),
        defaultImport: getDefaultImport(injectClasseList)
      });
      for (const injectClasse of injectClasseList) {
        const { abstractClasseName, alias, classeName } = injectClasse;
        injectContent += `
container.register('${abstractClasseName}', {
  useClass: ${alias !== "" ? alias : classeName} 
})`;
      }
    });
    injectContent += `
//------ inject end ------`;
    return {
      injectContent,
      importClasseList
    };
  }
}

const VERSION = version;
const cli = cac__default("tool-cabinet-cli");
cli.help();
cli.version(VERSION);
cli.option("-c, --config <file>", `[string] \u914D\u7F6E\u6587\u4EF6\u5730\u5740`);
cli.command("generate-request-code", "\u901A\u8FC7repository\u751F\u6210\u4EE3\u7801").action(async (options) => {
  const config = await loadGenerateRepositoryCodeConfig(options == null ? void 0 : options.config);
  const generateRequestCode = new GenerateRepositoryCode(config);
  generateRequestCode.run();
});
cli.command("tsyringe-inject", "\u751F\u6210tsyringe\u9700\u8981\u6CE8\u5165\u4EE3\u7801").action(async (options) => {
  const config = await loadTsyringeInjectConfig(options == null ? void 0 : options.config);
  const tsyringeInject = new TsyringeInject(config);
  tsyringeInject.run();
});
cli.parse();
