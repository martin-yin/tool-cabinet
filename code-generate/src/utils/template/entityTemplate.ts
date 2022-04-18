import { EntityTemplateType } from "../../interface";

export const entityTemplate = ({
  entity,
  functionList,
  entityTypeList,
}: EntityTemplateType) => {
  return `
    import { IResponse } from '@/infrastructure/lib/request'
    
    export abstract class ${entity}Repository {
      ${functionList
        .map((item) => {
          return `abstract ${item.abstractFunction}(${
            item.params !== "" ? "params: " + item.params : ""
          }): Promise<IResponse<${item.return}>>`;
        })
        .join("\n")}
    }

    ${entityTypeList.join("\n")}
`;
};
