import FormData from 'form-data'
import * as fs from 'fs'
import * as path from 'path'
import type { PluginOption } from 'vite'
import type { SourceMapUploadType } from './interface'
import axios from 'axios'

import {
  filterFileListOfIgnoreList,
  formatIgnoreList,
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
      const { include, token, release, uploadUrl } = option
      const ignoreList = await formatIgnoreList({
        ignore: option.ignore,
        ignoreFile: option.ignoreFile
      })
      const includeIgnoreFileMap = await getIncludeIgnoreFileMap(toArray(include), ignoreList, option.urlPrefix)

      for (const key of includeIgnoreFileMap.keys()) {
        const includeIgnoreFile = includeIgnoreFileMap.get(key)
        const filePath = path.join(process.cwd(), key)
        const fileListDisplay = getFileListDisplayOfExtension(filePath)
        const includeFileList = filterFileListOfIgnoreList(fileListDisplay, includeIgnoreFile?.ignoreList)

        includeFileList.forEach(file => {
          const formData = new FormData()

          formData.append('file', fs.createReadStream(file))
          // formData.append('release', release);
          // formData.append('token', token);
          // formData.append('urlPrefix', includeIgnoreFile?.urlPrefix);
          sourceMapFileList.push(formData)
        })
      }

      sourceMapFileList.forEach(formData => {
        const formHeaders = formData.getHeaders()

        axios
          .post(uploadUrl, formData, {
            headers: {
              ...formHeaders
            }
          })
          .then(res => {
            console.log(`${res.data.data.originalname} 文件上传服务器成功!`)
          })
      })
    }
  }
}
