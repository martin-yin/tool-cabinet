import { EntityTemplateType } from "./interface";
import { firstToUpper } from "./utils";
import { generateFile } from "./utils/file";
import { entityTemplate } from "./utils/template/entityTemplate";
import { modelTemplate } from "./utils/template/modelTemplate";
import { repositoryTemplate } from "./utils/template/repositoryTemplate";

export interface FileWriteOptions {
  modulePath: string;
  module: string;
  entityTypeList: string[];
  modelTypeList: string[];
  functionList: EntityTemplateType["functionList"];
}

abstract class IFileWrite {
  abstract writeFiles(): void;
  abstract writeEntityFile(): Promise<boolean>;
  abstract writeModelFile(): Promise<boolean>;
  abstract writeRepositoryFile(): Promise<boolean>;
}

export class FileWrite implements IFileWrite {
  private options: FileWriteOptions;
  private modelFile: string;
  private repositoryFile: string;

  init(options: FileWriteOptions) {
    this.options = options;
    this.modelFile = `${options.modulePath}/model`;
    this.repositoryFile = `${options.modulePath}/repository`;
  }

  async writeFiles() {
    const entityFileWrite = await this.writeEntityFile();
    if (entityFileWrite) {
      const modelFileWrite = await this.writeModelFile();
      if (modelFileWrite) {
        return await this.writeRepositoryFile();
      }
    }
  }

  async writeEntityFile(): Promise<boolean> {
    const { module, functionList, entityTypeList } = this.options;
    return await generateFile(
      this.modelFile,
      `${module}Entity.ts`,
      entityTemplate({
        entity: firstToUpper(module),
        functionList,
        entityTypeList,
      })
    );
  }

  async writeModelFile(): Promise<boolean> {
    const { module, modelTypeList } = this.options;
    return await generateFile(
      this.modelFile,
      `${module}Model.ts`,
      modelTemplate({
        modelTypeList,
      })
    );
  }

  async writeRepositoryFile(): Promise<boolean> {
    const { module, functionList } = this.options;
    return await generateFile(
      this.repositoryFile,
      `${module}Repository.ts`,
      repositoryTemplate({
        name: firstToUpper(module),
        functionList: functionList,
      })
    );
  }
}
