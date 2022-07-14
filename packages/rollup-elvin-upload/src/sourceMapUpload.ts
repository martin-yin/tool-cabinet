import axios from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'
import path from 'node:path'
import type { PluginOption } from 'vite'
import type { SourceMapUploadType } from './interface'

import {
  filterFileListOfIgnoreList,
  formatIgnoreList,
  formDataAppend,
  getFileListDisplayOfExtension,
  getIncludeIgnoreFileMap,
  toArray
} from './utils'

export default function elvinUpload(option: SourceMapUploadType): PluginOption {
  return {
    name: 'elvin-upload',
    async writeBundle() {
      console.log('打包结束了!')
      const sourceMapFileList: Array<FormData> = []
      const { include, token, release, uploadUrl, urlPrefix } = option
      const ignoreList = await formatIgnoreList({
        ignore: option.ignore,
        ignoreFile: option.ignoreFile
      })
      const includeIgnoreFileMap = await getIncludeIgnoreFileMap(toArray(include), ignoreList, urlPrefix)

      for (const key of includeIgnoreFileMap.keys()) {
        const includeIgnoreFile = includeIgnoreFileMap.get(key)
        const filePath = path.join(process.cwd(), key)
        const fileListDisplay = getFileListDisplayOfExtension(filePath)
        const includeFileList = filterFileListOfIgnoreList(fileListDisplay, includeIgnoreFile?.ignoreList)

        includeFileList.forEach(file => {
          const formData = formDataAppend({
            token,
            release,
            urlPrefix
          })
          formData.append('file', fs.createReadStream(file))
          sourceMapFileList.push(formData)
        })
      }

      sourceMapFileList.forEach(formData => {
        const formHeaders = formData.getHeaders()
        axios
          .post<{
            data: {
              originalname: string
              path: string
              size: number
              mimetype: string
            }
          }>(uploadUrl, formData, {
            headers: {
              ...formHeaders
            }
          })
          .then(({ data: { data } }) => {
            console.log(`${data.originalname} 文件上传服务器成功!`)
          })
          .catch(e => {
            console.log(`source map 文件上传失败：`, e)
          })
      })
    }
  }
}
