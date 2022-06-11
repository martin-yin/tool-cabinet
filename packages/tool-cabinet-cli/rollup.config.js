import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import path from 'path'
import esbuild from 'rollup-plugin-esbuild'

const packageJSON = require('./package.json')
const nodePath = path.resolve(__dirname)

const defaultConfig = {
  input: {
    index: path.resolve(nodePath, './src/cli.ts')
  },
  output: {
    dir: path.resolve('dist'),
    entryFileNames: `[name].js`,
    exports: 'named',
    format: 'cjs',
    externalLiveBindings: false,
    freeze: false
  },
  external: [...Object.keys(packageJSON.dependencies)],
  plugins: [
    nodeResolve(),
    json(),
    esbuild({
      tsconfig: path.resolve(nodePath, 'tsconfig.json'),
      exclude: ['packages/node/__tests__/**']
    }),
    commonjs()
  ]
}

function createConfig(isProduction) {
  /**
   * @type { import('rollup').RollupOptions }
   */
  const config = {
    ...defaultConfig,
    external: [...defaultConfig.external, ...(isProduction ? [] : Object.keys({ ...packageJSON.devDependencies }))]
  }
  return config
}

export default commandLineArgs => {
  const isDev = commandLineArgs.watch
  const isProduction = !isDev

  return [createConfig(isProduction)]
}
