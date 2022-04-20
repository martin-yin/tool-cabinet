import { CodeGenerateOptionsType } from './interface'
import { FileWrite } from './fileWrite'
import { ISourceCode, SourceCode } from './sourceCode'
import chalk from 'chalk'
export class CodeGenerate {
  public options: CodeGenerateOptionsType
  private basePath: string
  private sourceCode: ISourceCode
  private fileWrite: FileWrite

  /**
   *
   * @param options
   */
  constructor(options: CodeGenerateOptionsType) {
    this.options = options
    this.basePath = options.filePath
    this.sourceCode = new SourceCode()
    this.fileWrite = new FileWrite()
  }

  async run() {
    for (const domain of this.options.domains) {
      const { module } = domain
      const modulePath = `${this.basePath}/domain/${module}`
      const code = await this.sourceCode.mapFormSourceCode(domain)
      this.fileWrite.init({
        modulePath,
        module,
        sourceCode: code
      })
      const result = await this.fileWrite.writeFiles().finally(() => {
        this.sourceCode.initSourceCode()
      })

      if (result) {
        console.log(chalk.green(`模块${module}写入完成!\n`))
      } else {
        console.log(chalk.red(`模块${module}写入失败!\n`))
      }
    }
  }
}
