import chalk from 'chalk'
import { isArray, isEmpty } from 'underscore'
import { GenerateCodeOptionsType } from './interface'
import { SourceCode } from './sourceCode/sourceCode'
import { WriteFile } from './writeFile'

export class GenerateCode {
  public options: GenerateCodeOptionsType
  private sourceCode: SourceCode
  private writeFile: WriteFile

  /**
   *
   * @param options
   */
  constructor(
    options: GenerateCodeOptionsType = {
      filePath: '',
      domains: []
    }
  ) {
    this.options = options
    this.sourceCode = new SourceCode()
    this.writeFile = new WriteFile()
  }

  async run() {
    const {
      options: { filePath, domains }
    } = this

    if (isEmpty(filePath)) {
      throw Error('filePath不能为空!')
    }
    if (!isArray(domains)) {
      throw Error('domains不是数组!')
    }
    if (domains.length == 0) {
      throw Error('domains 长度不能为0!')
    }

    for (const domain of this.options.domains) {
      const { module } = domain
      const modulePath = `${this.options.filePath}/domain/${module}`
      await this.sourceCode.transformSourceCode(modulePath, domain)
      const sourceCodeList = this.sourceCode.sourceCodeList
      const result = this.writeFile.writeFiles(sourceCodeList)
      if (result) {
        console.log(chalk.green(`模块${module}写入完成!\n`))
      } else {
        throw Error(chalk.red(`模块${module}写入失败!\n`))
      }
    }
  }
}
