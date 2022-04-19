import path from "path";
import { CodeGenerateOptionsType } from "./interface";
import { FileWrite } from "./fileWrite";
import { SourceCode } from "./sourceCode";

export class CodeGenerate {
  public options: CodeGenerateOptionsType;
  private basePath: string;

  /**
   *
   * @param options
   */
  constructor(options: CodeGenerateOptionsType) {
    this.options = options;
    this.basePath = options.filePath;
  }

  async run() {
    for (const domain of this.options.domains) {
      const sourceCode = new SourceCode();
      const { module } = domain;
      const modulePath = `${this.basePath}/domain/${module}`;
      const code = await sourceCode.mapFormSourceCode(domain);
      const fileWrite = new FileWrite({
        modulePath,
        module,
        ...code,
      });
      if (await fileWrite.writeFiles()) {
        console.log(`模块${module}写入完成!`);
      }
    }
  }
}

new CodeGenerate({
  filePath:
    "C:/Users/martin-yin/Desktop/webHawkReport/web-dev-tools/code-generate/src",
  domains: [
    {
      module: "admin",
      repositorys: [
        {
          url: "http://127.0.0.1:8889/admin/adminLogin",
          method: "POST",
          body: {
            user_name: "admin",
            password: "123456",
          },
        },
        {
          url: "http://127.0.0.1:8889/admin/registerAdmin",
          method: "POST",
          body: {
            user_name: "admin1",
            password: "123456",
            nick_name: "123456",
          },
        },
      ],
    },
    {
      module: "admin",
      repositorys: [
        {
          url: "http://127.0.0.1:8889/admin/adminLogin",
          method: "POST",
          body: {
            user_name: "admin",
            password: "123456",
          },
        },
        {
          url: "http://127.0.0.1:8889/admin/registerAdmin",
          method: "POST",
          body: {
            user_name: "admin1",
            password: "123456",
            nick_name: "123456",
          },
        },
      ],
    },
  ],
}).run();
