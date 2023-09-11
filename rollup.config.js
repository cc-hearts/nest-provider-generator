import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import Json from '@rollup/plugin-json'
export default {
  input: './src/index.ts',
  output: {
    file: './bin/cli.mjs',
    format: 'esm',
  },
  plugins: [Json(), resolve(), commonjs(), typescript()],
}
