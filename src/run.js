const ProgramBuilder = require('brighterscript').ProgramBuilder;
// tslint:disable-next-line:origin-ordered-imports
const path = require('path');

const pluginPath = path.resolve(path.join('src', 'test', 'stubProject', 'bsconfig.json'));
let bsConfig = require(pluginPath);

let _programBuilder = new ProgramBuilder();
bsConfig.rootDir = path.resolve('src/test/stubProject/src');
bsConfig.plugins = ['/home/george/hope/open-source/roku-log-extension/dist/roku-log-extension/src/lib/plugin.js'];
// bsConfig.plugins = ['/home/george/hope/open-source/roku-log-extension/dist/roku-log-extension/src/plugin.js'];
_programBuilder.run(bsConfig);