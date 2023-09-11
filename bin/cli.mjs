import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'fs';
import { compile } from 'handlebars';
import * as process$1 from 'process';
import { argv } from 'process';
import { resolve, relative } from 'path';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import template from '@babel/template';
import { identifier } from '@babel/types';
import { parse } from '@babel/parser';

const _toString = Object.prototype.toString;
function isObject(val) {
    return _toString.call(val) === '[object Object]';
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param target - The string to be capitalized.
 * @return - The capitalized string.
 */
const capitalize = (target) => (target.charAt(0).toUpperCase() + target.slice(1));

const shortLine2VariableName = (shortLineArray) => {
    return shortLineArray.map((_) => capitalize(_)).join('');
};
function getArgv() {
    return argv.slice(2);
}
async function getNestCLIPathRoot() {
    try {
        let nestCliJson = await readFile(resolve(process.cwd(), 'nest-cli.json'), { encoding: 'utf-8' });
        nestCliJson = JSON.parse(nestCliJson);
        if (isObject(nestCliJson)) {
            const sourceRoot = Reflect.get(nestCliJson, 'sourceRoot');
            const pathRoot = resolve(process.cwd(), sourceRoot);
            return pathRoot;
        }
    }
    catch (e) { }
    return null;
}

function getCommand() {
    let [providerName] = getArgv();
    if (!providerName) {
        throw new Error('generator provider template have not name');
    }
    return providerName.trim();
}

const generatorModulesProvider = (sourceCode, importPath, providerName) => {
    const ast = parse(sourceCode, {
        sourceType: 'module',
        presets: ['@babel/preset-typescript'],
        plugins: ['decorators'],
    });
    traverse(ast, {
        Program(path) {
            let importDeclarationIndex = 0;
            if (Array.isArray(path.node.body)) {
                for (let i = 0; i < path.node.body.length; i++) {
                    if (path.node.body[i].type !== 'ImportDeclaration') {
                        importDeclarationIndex = i;
                        break;
                    }
                }
            }
            const importAst = template.ast(importPath);
            if (!isExistsImportProviderName(path.node.body, providerName))
                path.node.body.splice(importDeclarationIndex, 0, importAst);
        },
        ClassDeclaration(path) {
            for (let i = 0; i < path.node.decorators.length; i++) {
                const expression = path.node.decorators[i].expression;
                // @ts-ignore
                if (expression.callee.name === 'Module') {
                    // @ts-ignore
                    const target = expression.arguments[0].properties;
                    if (Array.isArray(target)) {
                        for (let j = 0; j < target.length; j++) {
                            if (target[j].key.name === 'providers') {
                                if (!isExistsModuleProvider(target[j].value.elements, providerName)) {
                                    const ast = identifier(providerName);
                                    target[j].value.elements.push(ast);
                                }
                            }
                        }
                    }
                }
            }
        },
    });
    const { code } = generate(ast);
    return code;
};
function isExistsModuleProvider(elements, providerName) {
    if (Array.isArray(elements)) {
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].name === providerName) {
                return true;
            }
        }
    }
    return false;
}
function isExistsImportProviderName(elements, providerName) {
    if (Array.isArray(elements)) {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.type === 'ImportDeclaration' &&
                element.specifiers &&
                Array.isArray(element.specifiers)) {
                for (let j = 0; j < element.specifiers.length; j++) {
                    if (element.specifiers[j].local.name === providerName) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

const writeProviderFile = async (fileDirPath, filePath, code) => {
    await mkdir(fileDirPath, { recursive: true });
    await writeFile(filePath, code, { encoding: 'utf-8' });
};
const writeModuleProviderFile = async (fileDirPath, variable, importRelativePath, exportProviderName) => {
    const moduleName = `${variable}.module.ts`;
    const modulePath = resolve(fileDirPath, '..', moduleName);
    if (existsSync(modulePath)) {
        const sourceCode = await readFile(modulePath, { encoding: 'utf-8' });
        const code = generatorModulesProvider(sourceCode, `import {${exportProviderName}} from './${importRelativePath}'`, exportProviderName);
        if (code) {
            await writeFile(modulePath, code, { encoding: 'utf-8' });
            console.log(`update ${moduleName} file success`);
        }
    }
};

const start = async () => {
    let dryRun = false, isExistsEntity = false;
    const variable = getCommand();
    const originRoot = await getNestCLIPathRoot();
    if (!originRoot)
        return;
    const variableName = variable
        .split('-')
        .map((val) => capitalize(val))
        .join('_');
    const pathRoot = resolve(originRoot, variable);
    const providerEntityImportName = shortLine2VariableName(variable.split('-'));
    if (existsSync(resolve(process$1.cwd(), pathRoot, `entities/${variable}.entity.ts`))) {
        isExistsEntity = true;
    }
    const providerEntityFileName = variable;
    const providerName = `${variableName}_provider`.toUpperCase();
    const providerNameUpper = providerName;
    const exportName = shortLine2VariableName([
        ...variable.split('-'),
        'provider',
    ]);
    const templateCode = await readFile(resolve(__dirname, './template.tmpl.js'), {
        encoding: 'utf-8',
    });
    const templateFn = compile(templateCode);
    const code = templateFn({
        providerEntityImportName,
        providerEntityFileName,
        providerName,
        providerNameUpper,
        exportName,
        isExistsEntity,
    });
    const fileDirPath = resolve(process$1.cwd(), pathRoot, 'providers');
    const filePath = resolve(fileDirPath, `${variable}.provider.ts`);
    if (existsSync(filePath)) {
        dryRun = true;
    }
    if (dryRun) {
        console.log(`dry run generator file path: ${filePath} success`);
    }
    else {
        let importRelativePath = relative(resolve(process$1.cwd(), pathRoot), filePath);
        importRelativePath = importRelativePath.substring(0, importRelativePath.lastIndexOf('.'));
        await Promise.all([
            writeProviderFile(fileDirPath, filePath, code),
            writeModuleProviderFile(fileDirPath, variable, importRelativePath, exportName),
        ]);
        console.log(`generator file path: ${filePath} success`);
    }
};
start();
