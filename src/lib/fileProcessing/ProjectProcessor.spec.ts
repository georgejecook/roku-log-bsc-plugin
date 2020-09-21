import { ProgramBuilder } from 'brighterscript';
import * as chai from 'chai';
// tslint:disable-next-line:origin-ordered-imports
import * as path from 'path';

const chaiSubset = require('chai-subset');

chai.use(chaiSubset);
let bsConfig = require('/home/george/hope/open-source/maestro-cli/src/test/stubProject/bsconfig.json'
);

describe('Project Processor', function() {
  beforeEach(() => {
    // fs.removeSync(config.outputPath);
  });

  describe('process some local projects - skip this on CI!', function() {
    beforeEach(() => {
      // fs.removeSync(config.outputPath);
    });

    it.only('Processes local test project', async function() {
      this.timeout(1000000000);
      let _programBuilder = new ProgramBuilder();
      bsConfig.rootDir = path.resolve('src/test/stubProject/src');
      await _programBuilder.run(bsConfig);
    });
  });
});
