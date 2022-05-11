import colors from 'picocolors'
import { GenerateRequestCodeOptionsType } from './interface'
import { SourceCode } from './sourceCode/sourceCode'
import { WriteFile } from './writeFile'

export class GenerateRequestCode {
  public options: GenerateRequestCodeOptionsType
  private sourceCode: SourceCode = new SourceCode()
  /**
   *
   * @param options
   */
  constructor(options: GenerateRequestCodeOptionsType) {
    this.options = options
  }

  async run() {
    const {
      options: { filePath, domains }
    } = this

    for (const domain of domains) {
      const { module } = domain
      const modulePath = `${filePath}/domain/${module}`
      const sourceCodeList = await this.sourceCode.transformSourceCode(modulePath, domain)
      const result = await WriteFile.writeFiles(sourceCodeList)
      if (result) {
        console.log(colors.green(`模块${module}写入完成!\n`))
      } else {
        throw Error(`模块${module}写入失败!\n`)
      }
    }
  }
}
