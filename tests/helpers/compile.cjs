const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const root = path.resolve(__dirname, '../..')
module.exports = function compile(file, mocks = {}) {
  const filename = path.join(root, file)
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022},
  }).outputText
  const loaded = new Module(filename, module)
  loaded.filename = filename
  loaded.paths = Module._nodeModulePaths(root)
  const original = loaded.require.bind(loaded)
  loaded.require = name => Object.hasOwn(mocks, name) ? mocks[name] : original(name)
  loaded._compile(code, filename)
  return loaded.exports
}
