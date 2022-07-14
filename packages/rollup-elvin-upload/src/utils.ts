import ignore from 'ignore'
import fs from 'node:fs'
import path from 'node:path'
import type { IncludeIgnoreFileMapType, IncludeType } from './interface'

/**
 *
 * @param value
 * @returns
 */
export function toArray(value: string | Array<IncludeType> | string[]): string[] | Array<IncludeType> {
  if (Array.isArray(value) || value === null || value === undefined) {
    return value
  }

  return [value]
}

/**
 *
 * @param option
 * @returns
 */
export async function formatIgnoreList(
  option: Pick<IncludeType, 'ignore' | 'ignoreFile'> = {
    ignore: '',
    ignoreFile: ''
  }
): Promise<string[]> {
  const ignoreList: string[] = []

  // 先去读取 ignore 获取到将要被忽略的数组
  if (option?.ignore) {
    ignoreList.push(...formatIgnore(option.ignore))
  }

  if (option?.ignoreFile) {
    ignoreList.push(...(await readIgnoreFile(option.ignoreFile)))
  }

  return ignoreList
}

/**
 *
 * @param ignore
 * @returns
 */
export function formatIgnore(ignore: string | string[]): string[] {
  if (typeof ignore === 'string') {
    return [ignore]
  }

  return ignore
}

/**
 * 读取文件内容
 * @param filePath
 * @returns Promise<string[]>
 */
export function readIgnoreFile(filePath: string): Promise<string[]> {
  const ignoreList: string[] = []

  return new Promise((resolve, reject) => {
    try {
      const ignoreContent = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8')

      ignoreContent.split('\n').forEach(item => {
        if (item !== '\r') {
          ignoreList.push(item.replace(/\r\n\s+/g, ''))
        }
      })
      resolve(ignoreList)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 *
 * @param includeList
 * @param ignoreList
 * @param urlPrefix
 * @returns
 */
export function getIncludeIgnoreFileMap(
  includeList: Array<IncludeType> | string[],
  ignoreList: string[],
  urlPrefix = ''
): Promise<Map<string, IncludeIgnoreFileMapType>> {
  const includeIgnoreFileMap = new Map<string, IncludeIgnoreFileMapType>()

  return new Promise(resolve => {
    includeList.forEach(async includeEntry => {
      if (typeof includeEntry === 'object' && includeEntry.ignore !== undefined) {
        // includeFileList.push(includeEntry);
        const { path } = includeEntry
        let includeEntryIgnoreList: string[] = []

        includeEntryIgnoreList = await formatIgnoreList(includeEntry)
        includeIgnoreFileMap.set(path, {
          ignoreList: includeEntryIgnoreList.length > 0 ? includeEntryIgnoreList : ignoreList,
          urlPrefix: includeEntry.urlPrefix ? includeEntry.urlPrefix : ''
        })
      } else if (typeof includeEntry === 'string') {
        includeIgnoreFileMap.set(includeEntry, {
          ignoreList,
          urlPrefix: urlPrefix ? urlPrefix : ''
        })
      }
    })
    resolve(includeIgnoreFileMap)
  })
}

/**
 * 根据地址读取文件内容
 * @param path
 * @returns
 */
export function getFileListByPath(path: string) {
  return fs.readFileSync(path)
}

/**
 * 将文件转换成字符串
 * @param filePath
 * @returns
 */
export function converFileToStr(filePath: string) {
  const realFilePath = path.join(process.cwd(), filePath)

  return fs.readFileSync(realFilePath, 'utf-8')
}

/**
 * 根据 IgnoreList 规则过滤文件列表
 * @param fileList
 * @param ignoreList
 * @returns
 */
export function filterFileListOfIgnoreList(fileList: string[], ignoreList: string[] = []): string[] {
  const ig = ignore().add(ignoreList)

  return ig.filter(fileList)
}

/**
 *  根据路径查询文件夹下的以某种格式结尾的文件
 * @param filePath
 * @param fileList
 * @param extension
 * @returns
 */
export function getFileListDisplayOfExtension(
  filePath: string,
  fileList: string[] = [],
  extension = '.js.map'
): string[] {
  const fileDirList = fs.readdirSync(filePath)

  fileDirList.forEach((fileDir: string) => {
    const itemFileDir = path.join(filePath, fileDir)
    const stats = fs.statSync(itemFileDir)
    const isFile = stats.isFile() //是文件
    const isDir = stats.isDirectory() //是文件夹

    // 判断是否以某种格式结尾
    if (isFile && itemFileDir.endsWith(extension)) {
      fileList.push(path.relative(process.cwd(), itemFileDir))
    }

    if (isDir) {
      getFileListDisplayOfExtension(itemFileDir, fileList)
    }
  })

  return fileList
}
