import type { RepositoryType } from './interface'

export class ContainerRepository {
  public readonly containerMap = new Map<string, RepositoryType[]>()

  public getRepository(module: string) {
    const repositorys = this.containerMap.get(module)
    if (repositorys === undefined) {
      throw new Error(`没有查询到${module}repositorys`)
    }
    return repositorys
  }

  public registerRepository(module: string, repositorys: RepositoryType[]) {
    this.containerMap.set(module, repositorys)
  }
}
