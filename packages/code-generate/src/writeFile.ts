import { SourceCodeType } from './interface'
import { entityTemplate } from './template/entityTemplate'
import { modelTemplate } from './template/modelTemplate'
import { repositoryTemplate } from './template/repositoryTemplate'
import { useCaseTemplate } from './template/useCaseTemplate'
import { firstToLower } from './utils'
import { generateFile } from './utils/file'
import chalk from 'chalk'

export interface WriteFileOptions {
  modulePath: string
  module: string
  sourceCode: SourceCodeType
}

export abstract class IWriteFile {
  abstract writeFiles(): Promise<boolean>
  abstract entityFileWrite(): Promise<boolean>
  abstract modelFileWrite(): Promise<boolean>
  abstract repositoryFileWrite(): Promise<boolean>
  abstract useCaseFilesWrite(): Promise<void | any>

  abstract runInit(options: WriteFileOptions): void
}

export class WriteFile implements IWriteFile {
  private options: WriteFileOptions
  private modelDir: string
  private repositoryDir: string
  private applicationDir: string

  runInit(options: WriteFileOptions) {
    this.options = options
    this.modelDir = `${options.modulePath}/model`
    this.repositoryDir = `${options.modulePath}/repository`
    this.applicationDir = `${options.modulePath}/application`
  }

  async writeFiles() {
    console.log(chalk.blue(`\n开始创建文件...\n`))
    const result = await Promise.all([this.entityFileWrite(), this.modelFileWrite(), this.repositoryFileWrite()]).catch(
      error => {
        console.log(chalk.red(`失败原因：${error} \n`))
      }
    )
    if (result[0]) {
      return await this.useCaseFilesWrite()
    }
    return false
  }

  async entityFileWrite(): Promise<boolean> {
    const {
      module,
      sourceCode: { entityCode }
    } = this.options
    return generateFile(this.modelDir, `${module}Entity.ts`, entityTemplate(entityCode))
  }

  async modelFileWrite(): Promise<boolean> {
    const {
      module,
      sourceCode: { modelCode }
    } = this.options
    return generateFile(this.modelDir, `${module}Model.ts`, modelTemplate(modelCode))
  }

  async repositoryFileWrite(): Promise<boolean> {
    const {
      module,
      sourceCode: { repositoryCode }
    } = this.options
    return generateFile(this.repositoryDir, `${module}Repository.ts`, repositoryTemplate(repositoryCode))
  }

  async useCaseFilesWrite(): Promise<void | any> {
    const { useCaseCode } = this.options.sourceCode

    const useCaseWriteAll = []
    for (const usecase of useCaseCode) {
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
      console.log(chalk.red(`失败原因：${error} \n`))
    })
  }
}
