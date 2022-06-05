import path from 'path'
import { Project, SourceFile } from 'ts-morph'
import { AbstractUtilsClasse } from '../src/utils/abstractUtilClasse'
import { ReferencedClasse } from '../src/referencedClasse'

describe('referencedClasse.test', () => {
  let project: Project

  let sourceFileList: SourceFile[]
  beforeEach(() => {
    project = new Project({
      tsConfigFilePath: path.join(__dirname, './testFile/tsconfig.json')
    })
    sourceFileList = project.addSourceFilesAtPaths([path.join(__dirname, './testFile/**/*.ts')])
  })

  describe('获取抽象类', () => {
    test('获取所有抽象类成功', () => {
      const result = AbstractUtilsClasse.GetAbstractClasseList(sourceFileList).length
      expect(result).toBe(1)
    })

    test('没有查询到抽象类', () => {
      const sourceFileList = project.addSourceFilesAtPaths([path.join(__dirname, './testFile/index.ts')])
      expect(() => {
        AbstractUtilsClasse.GetAbstractClasseList(sourceFileList)
      }).toThrow('没有查询到抽象类')
    })
  })

  describe('获取引用抽象类的 Node', () => {
    test('获取抽象类引用成功，并返回map', () => {
      const referencedClasse = new ReferencedClasse({ sourceFileList, ignoreAbstractList: [] })
      const classe = AbstractUtilsClasse.GetAbstractClasseList(sourceFileList)[0]
      expect(referencedClasse.getReferencedClasseMap(classe).has('ArticleRepository')).toBe(true)
    })

    test('获取抽象类引用失败', () => {
      const referencedClasse = new ReferencedClasse({ sourceFileList, ignoreAbstractList: [] })
      expect(() => {
        referencedClasse.getReferencedClasseMap(null)
      }).toThrow("获取抽象类引用链失败：Cannot read properties of null (reading 'getName')")
    })
  })

  const injectClasseList = [
    {
      defaultExport: '',
      classeName: 'TestArticleWebRepository',
      alias: '',
      abstractClasseName: 'ArticleRepository'
    },
    {
      defaultExport: 'TestArticleWebRepository2',
      classeName: 'TestArticleWebRepository2',
      alias: '',
      abstractClasseName: 'ArticleRepository'
    },
    {
      defaultExport: '',
      classeName: 'TestArticleWebRepository3',
      alias: '',
      abstractClasseName: 'ArticleRepository'
    }
  ]

  test('获取要被注入的数组类', () => {
    const referencedClasse = new ReferencedClasse({ sourceFileList, ignoreAbstractList: [] })
    const classe = AbstractUtilsClasse.GetAbstractClasseList(sourceFileList)[0]
    const referencedClasseMap = referencedClasse.getReferencedClasseMap(classe)
    const referencedNode = referencedClasseMap.get('ArticleRepository')
    const result = referencedClasse.getInjectClasseList(
      referencedNode,
      referencedNode.getSourceFile(),
      'ArticleRepository'
    )
    expect(result).toEqual(injectClasseList)
  })

  test('获取最总要被写入的map数据', () => {
    const referencedClasse = new ReferencedClasse({ sourceFileList, ignoreAbstractList: [] })
    const result = referencedClasse.getInjectSourceFileClassMap()
    result.forEach((value, key) => {
      expect(value).toEqual(injectClasseList)
      expect(key.getBaseName()).toEqual('index.ts')
    })
  })
})
