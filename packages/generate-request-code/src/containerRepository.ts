import { RepositoryType } from './interface'

export class ContainerRepository {
  public static readonly containerMap = new Map<string, RepositoryType[]>()

  public static getRepository(module: string) {
    const repositorys = ContainerRepository.containerMap.get(module)
    if (repositorys === undefined) {
      throw new Error(`没有查询到${module}repositorys`)
    }
    return repositorys
  }

  public static registerRepository(module: string, repositorys: RepositoryType[]) {
    ContainerRepository.containerMap.set(module, repositorys)
  }
}
