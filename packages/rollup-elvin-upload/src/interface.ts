export type IncludeType = {
  path: string
  ignore?: string | Array<string>
  ignoreFile?: string
  urlPrefix?: string
}

export type IncludeIgnoreFileMapType = {
  ignoreList: Array<string>
  urlPrefix: string
}

export interface SourceMapUploadType {
  // 如果不传递的话会去查询当前项目下所有的.js.map文件
  include: string | Array<IncludeType> | Array<string>
  token: string
  uploadUrl: string
  ignore?: string | Array<string>
  // 可以是 .gitignore 这种类型的文件
  ignoreFile?: string
  urlPrefix?: string
  // 版本
  release?: string
}
