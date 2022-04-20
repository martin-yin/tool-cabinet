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
  abstract writeUseCaseFiles(): Promise<void | any>
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
    const result = await Promise.all([this.writeEntityFile(), this.writeModelFile(), this.writeRepositoryFile()]).catch(
      error => {
        console.log('失败原因：', error)
      }
    )
    if (result) {
      return await this.writeUseCaseFiles()
    }

    return false
  }

  async writeEntityFile(): Promise<boolean> {
    const {
      module,
      sourceCode: { entitySource }
    } = this.options
    return generateFile(this.modelDir, `${module}Entity.ts`, entityTemplate(entitySource))
  }

  async writeModelFile(): Promise<boolean> {
    const {
      module,
      sourceCode: { modelSource }
    } = this.options
    return generateFile(this.modelDir, `${module}Model.ts`, modelTemplate(modelSource))
  }

  async writeRepositoryFile(): Promise<boolean> {
    const {
      module,
      sourceCode: { repositorySource }
    } = this.options
    return generateFile(this.repositoryDir, `${module}Repository.ts`, repositoryTemplate(repositorySource))
  }

  async writeUseCaseFiles(): Promise<void | any> {
    const {
      useCaseSource: { useCaseList }
    } = this.options.sourceCode

    const useCaseWriteAll = []
    for (const usecase of useCaseList) {
      useCaseWriteAll.push(
        generateFile(
          this.applicationDir,
          `${firstToLower(usecase.classeName)}.ts`,
          useCaseTemplate({
            ...usecase
          })
        )
      )
    }
    return Promise.all(useCaseWriteAll).catch(error => {
      console.log('失败原因：', error)
    })
  }
}
