import colors from 'picocolors'
import { GenerateRequestCodeOptionsType } from './interface'
import { SourceCode } from './sourceCode/sourceCode'
import { RepositoryRequest } from './utils/request'
import { WriteFile } from './writeFile'

export class GenerateRequestCode {
  public options: GenerateRequestCodeOptionsType
  private sourceCode: SourceCode
  private service: RepositoryRequest

  /**
   *
   * @param options
   */
  constructor(options: GenerateRequestCodeOptionsType) {
    const { requestConfig, interceptorRequest, interceptorResponse } = options
    this.options = options
    this.service = new RepositoryRequest({ requestConfig, interceptorRequest, interceptorResponse })
  }

  async run() {
    const {
      options: { filePath, domains }
    } = this
    for (const domain of domains) {
      this.sourceCode = new SourceCode()
      const { module } = domain
      const modulePath = `${filePath}/domain/${module}`
      const sourceCodeList = await this.sourceCode.transformSourceCode(this.service, modulePath, domain)
      const result = await WriteFile.writeFiles(sourceCodeList)
      if (result) {
        console.log(colors.green(`模块${module}写入完成!\n`))
      } else {
        throw Error(`模块${module}写入失败!\n`)
      }
    }
  }
}
