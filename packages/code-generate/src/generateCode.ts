import { GenerateCodeOptionsType } from './interface'
import chalk from 'chalk'
import { IWriteFile } from './writeFile'
import { ITransformCode } from './transformCode'

export class GenerateCode {
  public options: GenerateCodeOptionsType
  private transformCode: ITransformCode
  private writeFile: IWriteFile

  /**
   *
   * @param options
   */
  constructor(options: GenerateCodeOptionsType, transformCode: ITransformCode, writeFile: IWriteFile) {
    this.options = options
    this.transformCode = transformCode
    this.writeFile = writeFile
  }

  async run() {
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
        this.transformCode.clearSourceCode()
      })
      if (result) {
        console.log(chalk.green(`模块${module}写入完成!\n`))
      } else {
        console.log(chalk.red(`模块${module}写入失败!\n`))
      }
    }
  }
}
