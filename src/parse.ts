import traverse from '@babel/traverse'
import generate from '@babel/generator'
import template from '@babel/template'
import { identifier, Statement } from '@babel/types'
import { parse, ParserOptions } from '@babel/parser'

export const generatorModulesProvider = (
  sourceCode: string,
  importPath: string,
  providerName: string,
) => {
  const ast = parse(sourceCode, {
    sourceType: 'module',
    presets: ['@babel/preset-typescript'],
    plugins: ['decorators'],
  } as ParserOptions)

  traverse(ast, {
    Program(path) {
      let importDeclarationIndex = 0
      if (Array.isArray(path.node.body)) {
        for (let i = 0; i < path.node.body.length; i++) {
          if (path.node.body[i].type !== 'ImportDeclaration') {
            importDeclarationIndex = i
            break
          }
        }
      }
      const importAst = template.ast(importPath) as Statement
      if (!isExistsImportProviderName(path.node.body, providerName))
        path.node.body.splice(importDeclarationIndex, 0, importAst)
    },
    ClassDeclaration(path) {
      for (let i = 0; i < path.node.decorators!.length; i++) {
        const expression = path.node.decorators![i].expression
        // @ts-ignore
        if (expression.callee.name === 'Module') {
          // @ts-ignore
          const target = expression.arguments[0].properties
          if (Array.isArray(target)) {
            for (let j = 0; j < target.length; j++) {
              if (target[j].key.name === 'providers') {
                if (
                  !isExistsModuleProvider(
                    target[j].value.elements,
                    providerName,
                  )
                ) {
                  const ast = identifier(providerName)
                  target[j].value.elements.push(ast)
                }
              }
            }
          }
        }
      }
    },
  })
  const { code } = generate(ast)
  return code
}

function isExistsModuleProvider(elements: any, providerName: string) {
  if (Array.isArray(elements)) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].name === providerName) {
        return true
      }
    }
  }
  return false
}

function isExistsImportProviderName(elements: any, providerName: string) {
  if (Array.isArray(elements)) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      if (
        element.type === 'ImportDeclaration' &&
        element.specifiers &&
        Array.isArray(element.specifiers)
      ) {
        for (let j = 0; j < element.specifiers.length; j++) {
          if (element.specifiers[j].local.name === providerName) {
            return true
          }
        }
      }
    }
  }
  return false
}
