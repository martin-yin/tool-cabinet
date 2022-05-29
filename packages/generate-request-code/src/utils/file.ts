import fs from 'fs'
import path from 'path'
import colors from 'picocolors'
import { isEmpty } from 'underscore'

export async function existDirectoryCreate(directory: string) {
  const { dir } = path.parse(directory)
  if (isEmpty(dir)) {
    console.log('路径不能为空')
    return false
  }
  if (fs.existsSync(directory)) {
    return true
  }
  return fs.mkdirSync(directory, { recursive: true })
}

export function generateFile(directory: string, file: string, data: string) {
  if (fs.existsSync(`${directory}/${file}`)) {
    console.log(colors.red(`创建文件失败，${directory}路径下${file}文件已经存在 \n`))
  }
  if (existDirectoryCreate(directory)) {
    console.log(colors.blue(`正在创建创建文件: ${directory}${file} \n`))
    try {
      fs.writeFileSync(`${directory}/${file}`, data, 'utf8')
      console.log(colors.green(`创建创建文件成功: ${file} \n`))
      return true
    } catch (error) {
      console.log(colors.red(`创建文件失败 ${directory}${file}, ${error.message} \n`))
      return false
    }
  }
}
