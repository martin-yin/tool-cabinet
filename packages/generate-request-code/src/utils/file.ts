import fs from 'fs'
import path from 'path'
import colors from 'picocolors'
import { isEmpty } from 'underscore'

export async function dotExistDirectoryCreate(directory: string): Promise<boolean> {
  const { dir } = path.parse(directory)
  if (isEmpty(dir)) {
    console.log('路径不能为空')
    return false
  }
  if (fs.existsSync(directory)) {
    return true
  }
  fs.mkdirSync(directory, { recursive: true })
  return true
}

export async function generateFile(directory: string, file: string, data: string): Promise<boolean> {
  if (fs.existsSync(`${directory}/${file}`)) {
    console.log(colors.red(`创建文件失败，${file}文件已经存在 \n`))
    return false
  }
  if (await dotExistDirectoryCreate(directory)) {
    console.log(colors.blue(`正在创建创建文件: ${directory}${file} \n`))
    try {
      fs.writeFileSync(`${directory}/${file}`, data, 'utf8')
      console.log(colors.green(`创建创建文件成功: ${file} \n`))
      return true
    } catch (error) {
      console.log(colors.red(`创建文件失败, ${error.message} \n`))
      return false
    }
  }
}
