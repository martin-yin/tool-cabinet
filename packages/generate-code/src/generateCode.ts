import colors from 'picocolors'
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
  constructor(options: GenerateCodeOptionsType) {
    this.options = options
    this.sourceCode = new SourceCode()
    this.writeFile = new WriteFile()
  }

  async run() {
    const {
      options: { filePath, domains }
    } = this

    for (const domain of domains) {
      const { module } = domain
      const modulePath = `${filePath}/domain/${module}`
      await this.sourceCode.transformSourceCode(modulePath, domain)
      const sourceCodeList = this.sourceCode.sourceCodeList
      const result = await this.writeFile.writeFiles(sourceCodeList)
      if (result) {
        console.log(colors.green(`模块${module}写入完成!\n`))
      } else {
        throw Error(`模块${module}写入失败!\n`)
      }
    }
  }
}
