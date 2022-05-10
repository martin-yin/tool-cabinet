import axios, { AxiosRequestConfig, Method } from 'axios'
import colors from 'picocolors'
import parse from 'url-parse'
import { RepositoryType } from '../interface'
import { entityTemplate } from '../template/entityTemplate'
import { modelTemplate } from '../template/modelTemplate'
import { repositoryTemplate } from '../template/repositoryTemplate'
import { useCaseTemplate } from '../template/useCaseTemplate'
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

export function getNames(module: string, repository: RepositoryType) {
  const { method, url } = repository

  // 如果last 是number的话
  const last = getUrlLast(url)
  const paramsType = isNaN(parseInt(last)) ? `${method}-${module}-${last}-params` : `${method}-${module}-params`
  return {
    method: toLower(method),
    entityType: toUpperCaseBySymbol(`${method}-${module}-entity`),
    paramsType: toUpperCaseBySymbol(paramsType),
    modelName: toUpperCaseBySymbol(`${method}-${module}-model`),
    funcName: getFuncName(method, module, last)
  }
}

export function getFuncName(method: Method, module: string, last: string) {
  let api = ''
  const fristUpperMethod = toLower(method)
  if (last === module) {
    api = firstToUpper(`${module}`)
  } else {
    const apiName = isNaN(parseInt(last)) ? `${module}-${last}` : module
    api = toUpperCaseBySymbol(apiName)
  }
  return `${fristUpperMethod}${api}`
}

export function getUrlLast(url: string) {
  const { pathname } = parse(url)
  const pathnameArr = pathname.split('/')
  const last = pathnameArr[pathnameArr.length - 1]
  return last
}

export function getPathName(url: string) {
  const { pathname } = parse(url)
  return pathname
}

export async function repositoryRequest(config: AxiosRequestConfig): Promise<any> {
  try {
    const result = await axios.request(config)
    if (result.status < 300) {
      return result.data
    }
    return null
  } catch (error) {
    console.log(colors.red(`失败原因：${error.toString()} \n`))
    return null
  }
}

export function transformType(data: string, typeName: string) {
  const json2ts = new Json2Ts()
  return json2ts.convert(data, typeName)
}

const template = {
  entity: entityTemplate,
  model: modelTemplate,
  repository: repositoryTemplate,
  useCase: useCaseTemplate
}

export const getTemplate = new Proxy(template, {
  get(target, phrase: string) {
    if (phrase in target) {
      return Reflect.get(target, phrase)
    } else {
      console.log(colors.red(`没有查询到${phrase}Template 模板\n`))
      return null
    }
  }
})
