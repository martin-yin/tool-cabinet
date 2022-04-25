import { GenerateCodeOptionsType } from './interface'
import chalk from 'chalk'
import { IWriteFile } from './writeFile'
import { ITransformCode } from './transformCode'
import { isArray, isEmpty } from 'underscore'

export class GenerateCode {
  public options: GenerateCodeOptionsType
  private transformCode: ITransformCode
  private writeFile: IWriteFile

  /**
   *
   * @param options
   */
  constructor(
    options: GenerateCodeOptionsType = {
      filePath: '',
      domains: []
    },
    transformCode: ITransformCode,
    writeFile: IWriteFile
  ) {
    this.options = options
    this.transformCode = transformCode
    this.writeFile = writeFile
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
      const code = await this.transformCode.transformSourceCode(domain)
      this.writeFile.runInit({
        modulePath,
        module,
        sourceCode: code
      })
      const result = await this.writeFile.writeFiles().finally(() => {
        this.transformCode.initSourceCode()
      })
      if (result) {
        console.log(chalk.green(`模块${module}写入完成!\n`))
      } else {
        throw Error(chalk.red(`模块${module}写入失败!\n`))
      }
    }
  }
}
