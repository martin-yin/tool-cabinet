import { RepositoryTemplateType } from "../../interface";

export const repositoryTemplate = ({
  name,
  functionList,
}: RepositoryTemplateType) => {
  return `
  import { HttpService } from '@/infrastructure/interface/http'
  import { IResponse } from '@/infrastructure/lib/request'
  import { inject, injectable } from 'tsyringe'
 
  
  @injectable()
  export class ${name}WebRepository implements ${name}Repository {
    constructor(@inject('HttpService') private webHttpService: HttpService) {}

    ${functionList
      .map((item) => {
        return `
      async ${item.abstractFunc}(${
          item.params !== "" ? "params: " + item.params : ""
        }): Promise<IResponse<${item.return}>> {
        return await this.webHttpService.${item.method}('${item.requestUrl}' ${
          item.params !== "" ? ",params" : ""
        })
      }
      `;
      })
      .join("\n")}
    }
`;
};