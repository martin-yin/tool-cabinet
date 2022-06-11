import { build } from 'esbuild'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { GenerateRepositoryCodeOptionsType } from './generateRepositoryCode/interface'
import { TsyringeInjectOptionsType } from './tsyringeInject/interface'

/**
 * 定义 GenerateRepositoryCode 配置
 * @public
 */
export function defineGenerateRepositoryCodeConfig(
  config: GenerateRepositoryCodeOptionsType
): GenerateRepositoryCodeOptionsType {
  return config
}

/**
 * 定义 TsyringeInject 配置
 * @public
 */
export function defineTsyringeInjectConfig(config: TsyringeInjectOptionsType): TsyringeInjectOptionsType {
  return config
}

export async function loadTsyringeInjectConfig(configFile?: string) {
  const config = await loadConfigFromFile('tsyringe-inject-code', configFile)
  return config as TsyringeInjectOptionsType
}

export async function loadGenerateRepositoryCodeConfig(configFile?: string) {
  const config = await loadConfigFromFile('generate-repository-code', configFile)
  return config as GenerateRepositoryCodeOptionsType
}

/**
 * 读取 config 文件内容
 * @param configName
 * @param configFile
 * @returns
 */
export async function loadConfigFromFile(configName: string, configFile?: string) {
  const { resolvedPath, isTS } = getConfigResolvePath(configName, configFile)
  try {
    let userConfig: GenerateRepositoryCodeOptionsType | TsyringeInjectOptionsType | undefined
    const fileUrl = pathToFileURL(resolvedPath)
    if (isTS) {
      userConfig = await readBundleConfig(resolvedPath)
    } else {
      userConfig = (await require(`${fileUrl}`)).default
    }
    return userConfig
  } catch (e) {
    console.log(e)
    return null
  }
}

/**
 * 读取编译后的config 文件
 * @param resolvedPath
 * @returns
 */
async function readBundleConfig(resolvedPath: string) {
  // 编译文件
  const bundled = await bundleConfigFile(resolvedPath, false)
  fs.writeFileSync(resolvedPath + '.js', bundled.code)
  const userConfig: GenerateRepositoryCodeOptionsType | TsyringeInjectOptionsType | undefined = (
    await require(`${resolvedPath}.js`)
  ).default
  // 引入完成，再去删掉文件
  fs.unlinkSync(resolvedPath + '.js')
  return userConfig
}

/**
 * 获取 config 解析路径
 * @param configName
 * @param configFile
 * @param configRoot
 * @returns
 */
function getConfigResolvePath(configName: string, configFile?: string, configRoot: string = process.cwd()) {
  let resolvedPath: string | undefined
  let isTS = false
  if (configFile) {
    resolvedPath = path.resolve(configFile)
    isTS = configFile.endsWith('.ts')
  } else {
    if (!resolvedPath) {
      const jsconfigFile = path.resolve(configRoot, `${configName}.js`)
      if (fs.existsSync(jsconfigFile)) {
        resolvedPath = jsconfigFile
      }
    }
    if (!resolvedPath) {
      const tsconfigFile = path.resolve(configRoot, `${configName}.ts`)
      if (fs.existsSync(tsconfigFile)) {
        resolvedPath = tsconfigFile
        isTS = true
      }
    }
  }
  if (!resolvedPath) {
    throw Error(`没有查询到 ${configName} 配置文件！`)
    return null
  }
  return { isTS, resolvedPath }
}

async function bundleConfigFile(fileName: string, isESM = false): Promise<{ code: string; dependencies: string[] }> {
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: [fileName],
    outfile: 'out.js',
    write: false,
    platform: 'node',
    bundle: true,
    format: isESM ? 'esm' : 'cjs',
    sourcemap: 'inline',
    metafile: true,
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, args => {
            const id = args.path
            if (id[0] !== '.' && !path.isAbsolute(id)) {
              return {
                external: true
              }
            }
          })
        }
      },
      {
        name: 'replace-import-meta',
        setup(build) {
          build.onLoad({ filter: /\.[jt]s$/ }, async args => {
            const contents = await fs.promises.readFile(args.path, 'utf8')
            return {
              loader: args.path.endsWith('.ts') ? 'ts' : 'js',
              contents: contents
                .replace(/\bimport\.meta\.url\b/g, JSON.stringify(pathToFileURL(args.path).href))
                .replace(/\b__dirname\b/g, JSON.stringify(path.dirname(args.path)))
                .replace(/\b__filename\b/g, JSON.stringify(args.path))
            }
          })
        }
      }
    ]
  })
  const { text } = result.outputFiles[0]
  return {
    code: text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : []
  }
}
