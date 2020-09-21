#!/usr/bin/env node

import { inspect } from 'util';

import { createProcessorConfig } from './lib/fileProcessing/ProcessorConfig';
import { addCreateViewCommand } from './lib/projectCommands/CreateViewCommand';
import { addInstallFrameworkCommand, InstallFrameworkCommand } from './lib/projectCommands/InstallFrameworkCommand';

const program = require('commander');
const pkg = require('../package.json');
const path = require('path');

program
  .version(pkg.version)
  .description(`
  Command Line Interface for Maestro projects.
  Read more here https://github.com/georgejecook/maestro/blob/master/docs/index.md#maestro-cli
`);

addInstallFrameworkCommand(program);
addCreateViewCommand(program);

program.parse(process.argv);
