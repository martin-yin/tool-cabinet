import { InjectClasseType } from '../interface'

/**
 *
 * @param value
 * @returns string
 */
export function spaceReplace(value: string): string {
  return value.replace(/\s*/g, '')
}

export function deduplicationByClasseName(arr: InjectClasseType[]) {
  const obj = {}
  return arr.reduce((item, next) => {
    obj[next.classeName] ? '' : (obj[next.classeName] = true && item.push(next))
    return item
  }, [])
}

/**
 *
 * @param injectClasseList
 * @returns
 */
export function getNamedImportList(injectClasseList: InjectClasseType[]) {
  return injectClasseList
    .filter(injectClasse => injectClasse.defaultExport === '')
    .map(injectClasse => {
      const { alias, classeName } = injectClasse
      if (alias !== '') {
        return alias
      }
      return classeName
    })
}

/**
 * 获取默认导出的类
 * @param injectClasseList
 * @returns
 */
export function getDefaultImport(injectClasseList: InjectClasseType[]) {
  const injectClasse = injectClasseList.find(injectClasse => injectClasse.defaultExport !== '')
  if (injectClasse) {
    return injectClasse.defaultExport
  }
}
