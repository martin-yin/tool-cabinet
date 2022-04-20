import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

export function dotExistDirectoryCreate(directory: string) {
  return new Promise(resolve => {
    mkdirs(directory, function () {
      resolve(true)
    })
  })
}

export function mkdirs(directory: string, callback: () => void) {
  var exists = fs.existsSync(directory)
  if (exists) {
    callback()
  } else {
    mkdirs(path.dirname(directory), function () {
      fs.mkdirSync(directory)
      callback()
    })
  }
}

export async function generateFile(directory: string, file: string, data: string): Promise<boolean> {
  if (!fs.existsSync(directory)) {
    await dotExistDirectoryCreate(directory)
  }
  if (fs.existsSync(`${directory}/${file}`)) {
    console.log(chalk.red(`创建文件失败，${file}文件已经存在 \n`))
    return false
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(`${directory}/${file}`, data, 'utf8', err => {
      console.log(chalk.blue(`正在创建创建文件: ${directory} \n`))
      if (err) {
        console.log(chalk.red(`创建文件失败，${file}文件已经存在 \n`))
        reject(err)
      } else {
        console.log(chalk.green(`创建创建文件成功: ${file} \n`))
        resolve(true)
      }
    })
  })
}
