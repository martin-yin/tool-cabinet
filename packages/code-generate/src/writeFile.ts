import chalk from 'chalk'
import { SourceCodeListType, SourceCodeType } from './interface/sourceCode'
import { getTemplate } from './utils'
import { generateFile } from './utils/file'

export class WriteFile {
  async writeFiles(sourceCodeList: SourceCodeListType) {
    console.log(chalk.blue(`\n开始创建文件...\n`))
    const writeFilePromises = sourceCodeList.map(async item => {
      return this.sourceCodeFileWrite(item)
    })
    const result = Promise.all(writeFilePromises).catch(error => {
      console.log(chalk.red(`失败原因：${error} \n`))
    })
    if (result[0]) {
      return true
    }
    return false
  }

  async sourceCodeFileWrite(sourceCode: SourceCodeType): Promise<boolean> {
    const { fileName, filePath, template, code } = sourceCode
    const templateWrite = getTemplate[template]
    return generateFile(filePath, fileName, templateWrite(code))
  }
}
