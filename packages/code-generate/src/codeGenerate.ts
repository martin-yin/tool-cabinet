import { CodeGenerateOptionsType } from "./interface";
import { FileWrite } from "./fileWrite";
import { ISourceCode, SourceCode } from "./sourceCode";

export class CodeGenerate {
  public options: CodeGenerateOptionsType;
  private basePath: string;
  private sourceCode: ISourceCode;
  private fileWrite: FileWrite;

  /**
   *
   * @param options
   */
  constructor(options: CodeGenerateOptionsType) {
    this.options = options;
    this.basePath = options.filePath;
    this.sourceCode = new SourceCode();
    this.fileWrite = new FileWrite();
  }

  async run() {
    for (const domain of this.options.domains) {
      const { module } = domain;
      const modulePath = `${this.basePath}/domain/${module}`;
      const code = await this.sourceCode.mapFormSourceCode(domain);
      this.fileWrite.init({
        modulePath,
        module,
        ...code,
      });
      if (await this.fileWrite.writeFiles()) {
        console.log(`模块${module}写入完成!`);
      }
      this.sourceCode.clearSourceCode();
    }
  }
}