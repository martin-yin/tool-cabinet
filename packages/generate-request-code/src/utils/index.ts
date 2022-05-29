import { Method } from 'axios'
import parse from 'url-parse'
import { PluginType, RepositoryType } from '../interface'
import { Json2Ts } from './json2ts'

export function toUpperCaseBySymbol(str: string, symbol = '-') {
  const newStr = str.trim().toLowerCase()
  return newStr
    .split(symbol)
    .map((value: string) => firstToUpper(value))
    .join('')
}

export function firstToUpper(str: string) {
  return str.trim().replace(str[0], str[0].toUpperCase())
}

export function toLower(str: string) {
  return str.toLowerCase()
}

export function firstToLower(str: string) {
  return str.trim().replace(str[0], str[0].toLowerCase())
}

export function isEmpty(str: string) {
  return str.trim() === ''
}

// TODO: 拆成一个个单独的方法, getNames 职责太多。
export function getNames(module: string, repository: RepositoryType) {
  const { method, url } = repository
  const last = getUrlLast(url)
  return {
    method: getMethod(method),
    entityType: getEntityType(method, module),
    paramsType: repository.params || repository.data ? getParamsType(method, module, last) : '',
    modelName: getModelName(method, module),
    funcName: getFuncName(method, module, last)
  }
}

export function getModelName(method: string, module: string) {
  const modelName = `${method}-${module}-model`
  return toUpperCaseBySymbol(modelName)
}

export function getEntityType(method: string, module: string) {
  const entityType = `${method}-${module}-entity`
  return toUpperCaseBySymbol(entityType)
}

export function getMethod(method: string) {
  return toLower(method)
}

export function getParamsType(method: string, module: string, last: string) {
  const paramsType = isEmpty(last)
    ? `${method}-${module}-by-id-params`
    : module === last
    ? `${method}-${module}-params`
    : `${method}-${module}-${last}-params`
  return toUpperCaseBySymbol(paramsType)
}

export function getFuncName(method: Method, module: string, last: string) {
  let api = ''
  if (last === module) {
    api = firstToUpper(`${module}`)
  } else {
    const apiName = isEmpty(last) ? `${module}-by-id` : `${module}-${last}`
    api = toUpperCaseBySymbol(apiName)
  }
  return `${toLower(method)}${api}`
}

export function getUrlLast(url: string) {
  const { pathname } = parse(url)
  const last = pathname.split('/').pop()
  return isNaN(parseInt(last)) ? last : ''
}

export function getPathName(url: string) {
  const { pathname } = parse(url)
  return pathname
}

export function convertType(data: string, typeName: string) {
  const json2ts = new Json2Ts()
  return json2ts.convert(data, typeName)
}
