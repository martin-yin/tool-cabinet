import { build } from 'esbuild'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import type { OptionsType } from './interface'

export async function bundleConfigFile(
  fileName: string,
  isESM = false
): Promise<{ code: string; dependencies: string[] }> {
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

/**
 *
 * @public
 */
export function defineConfig(config: OptionsType): OptionsType {
  return config
}

export async function loadConfigFromFile(configFile?: string, configRoot: string = process.cwd()) {
  let resolvedPath: string | undefined
  let isTS = false
  if (configFile) {
    resolvedPath = path.resolve(configFile)
    isTS = configFile.endsWith('.ts')
  } else {
    if (!resolvedPath) {
      const jsconfigFile = path.resolve(configRoot, 'generate-request-code.config.js')
      if (fs.existsSync(jsconfigFile)) {
        resolvedPath = jsconfigFile
      }
    }
    if (!resolvedPath) {
      const tsconfigFile = path.resolve(configRoot, 'generate-request-code.config.ts')
      if (fs.existsSync(tsconfigFile)) {
        resolvedPath = tsconfigFile
        isTS = true
      }
    }
  }
  if (!resolvedPath) {
    throw Error('没有查询到配置文件！')
    return null
  }
  try {
    let userConfig: OptionsType | undefined
    const fileUrl = pathToFileURL(resolvedPath)
    const bundled = await bundleConfigFile(resolvedPath, false)
    if (isTS) {
      fs.writeFileSync(resolvedPath + '.js', bundled.code)
      userConfig = (await require(`${resolvedPath}.js`)).default
      fs.unlinkSync(resolvedPath + '.js')
    } else {
      userConfig = (await require(`${fileUrl}`)).default
    }
    return userConfig
  } catch (e) {
    console.log(e)
    return null
  }
}

function elementType(ele) {
  const typeStr = Object.prototype.toString.call(ele)
  const reg = /^\[object\s([A-Za-z]+)\]$/
  reg.test(typeStr)
  return RegExp.$1.toLowerCase()
}
const jsonStr = `
{
  "date": "2021-08-28",
  "season": "ordinary",
  "season_week": 21,
  "celebrations": [
    {
      "title": "Saint Augustine of Hippo, bishop and doctor of the Church",
      "colour": "white",
      "rank": "memorial",
      "rank_num": 3.1
    }
  ],
  "weekday": "saturday"
}
`
elementType(jsonStr)
