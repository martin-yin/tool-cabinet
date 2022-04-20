import { SourceCodesType } from './interface'
import { entityTemplate } from './template/entityTemplate'
import { modelTemplate } from './template/modelTemplate'
import { repositoryTemplate } from './template/repositoryTemplate'
import { useCaseTemplate } from './template/useCaseTemplate'
import { firstToLower } from './utils'
import { generateFile } from './utils/file'

export interface FileWriteOptions {
  modulePath: string
  module: string
  sourceCode: SourceCodesType
}

abstract class IFileWrite {
  abstract writeFiles(): void
  abstract writeEntityFile(): Promise<boolean>
  abstract writeModelFile(): Promise<boolean>
  abstract writeRepositoryFile(): Promise<boolean>
}

export class FileWrite implements IFileWrite {
  private options: FileWriteOptions
  private modelDir: string
  private repositoryDir: string
  private applicationDir: string

  init(options: FileWriteOptions) {
    this.options = options
    this.modelDir = `${options.modulePath}/model`
    this.repositoryDir = `${options.modulePath}/repository`
    this.applicationDir = `${options.modulePath}/application`
  }

  async writeFiles() {
    const entityFileWrite = await this.writeEntityFile()
    if (entityFileWrite) {
      const modelFileWrite = await this.writeModelFile()
      if (modelFileWrite) {
        const repositoryFileWrite = await this.writeRepositoryFile()
        if (repositoryFileWrite) {
          return await this.writeUseCaseFile()
        }
      }
    }
  }

  async writeEntityFile(): Promise<boolean> {
    const {
      module,
      sourceCode: { entitySource }
    } = this.options
    return await generateFile(this.modelDir, `${module}Entity.ts`, entityTemplate(entitySource))
  }

  async writeModelFile(): Promise<boolean> {
    const {
      module,
      sourceCode: { modelSource }
    } = this.options
    return await generateFile(this.modelDir, `${module}Model.ts`, modelTemplate(modelSource))
  }

  async writeRepositoryFile(): Promise<boolean> {
    const {
      module,
      sourceCode: { repositorySource }
    } = this.options
    return await generateFile(this.repositoryDir, `${module}Repository.ts`, repositoryTemplate(repositorySource))
  }

  async writeUseCaseFile() {
    const {
      useCaseSource: { useCaseList }
    } = this.options.sourceCode
    for (const usecase of useCaseList) {
      const reulst = await generateFile(
        this.applicationDir,
        `${firstToLower(usecase.classeName)}.ts`,
        useCaseTemplate({
          ...usecase
        })
      )
      if (!reulst) {
        console.log(`文件${usecase.classeName}.ts 写入失败`)
        break
      }
    }
    return true
  }
}
