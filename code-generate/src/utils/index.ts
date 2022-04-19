import axios, { AxiosRequestConfig } from "axios";
import parse from "url-parse";

export function fristToUpperCase(str: string) {
  const newStr = str.trim().toLowerCase();
  return newStr
    .split("-")
    .map((value: string) => firstToUpper(value))
    .join("");
}

export function firstToUpper(str: string) {
  return str.trim().toLowerCase().replace(str[0], str[0].toUpperCase());
}

export function getNames(method: string, module: string, url: string) {
  const { pathname } = parse(url);
  const pathnameArr = pathname.split("/");
  const last = pathnameArr[pathnameArr.length - 1];
  return {
    entity: fristToUpperCase(`${method}-${module}-entity`),
    params: fristToUpperCase(`${method}-${module}-${last}-params`),
    model: fristToUpperCase(`${method}-${module}-model`),
    abstractFunc: getAbstractFunc(method, module, last),
  };
}

export function getAbstractFunc(method: string, module: string, last: string) {
  return firstToUpper(method) + fristToUpperCase(`${module}-${last}`);
}

export function getPathName(url: string) {
  const { pathname } = parse(url);
  return pathname;
}

export async function repositoryRequest(
  config: AxiosRequestConfig
): Promise<any> {
  const result = await axios.request(config);
  if (result.status == 200) {
    return result.data;
  }
  return null;
}
