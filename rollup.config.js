import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import Json from '@rollup/plugin-json'
export default {
  input: './src/index.ts',
  output: {
    file: './bin/cli.mjs',
    format: 'esm',
  },
  external: [
    'rollup',
    '@rollup/plugin-commonjs',
    '@rollup/plugin-typescript',
    '@rollup/plugin-node-resolve',
  ],
  plugins: [Json(), typescript(), resolve(), commonjs()],
}
