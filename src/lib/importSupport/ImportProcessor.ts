'use strict';
import { BrsFile, TokenKind } from 'brighterscript';
import { Position, Range } from 'vscode-languageserver';

import { ImportStatement } from 'brighterscript/dist/parser';

import { File } from '../fileProcessing/File';
import { addErrorDiagnostic, createDiagnostic } from '../utils/Feedback';
import { createToken } from '../utils/Utils';

/**
 * Manages build imports
 */
export default class ImportProcessor {
  constructor(config: any) {
    this.config = config;
  }

  private config: any;

  private getImportStatements(file: BrsFile, buildKey: string, previousImport: ImportStatement) {
    let imports = [];
    let importValues = this.config.buildTimeImports ? this.config.buildTimeImports[buildKey] : null;
    if (importValues && importValues.length > 0) {
      for (const importText of this.config.buildTimeImports[buildKey]) {

        let importToken = createToken(TokenKind.Import, previousImport.importToken.range.start, 'import');
        let filePathToken = createToken(TokenKind.SourceFilePathLiteral, previousImport.importToken.range.start, `"${importText}"`);
        imports.push(new ImportStatement(importToken, filePathToken));
      }
    } else {
      file.addDiagnostics([createDiagnostic(file, 9009, `xml file imports a build time import key that was not defined in your config:file that cannot be found ${buildKey}`)]);
    }
    return imports;
  }

  public processDynamicImports(file: BrsFile) {
    let statementsToRemove = [];
    let statementsToAdd = [];
    for (let importStatement of file.parser.importStatements) {
      if (importStatement.filePath.startsWith('build:/')) {
        let key = importStatement.filePath.replace('build:/', '');
        statementsToRemove.push(importStatement);
        statementsToAdd = statementsToAdd.concat(this.getImportStatements(file, key, importStatement));
      }
    }

    if (statementsToRemove.length > 0) {
      file.parser.importStatements = file.parser.importStatements.filter((el) => !statementsToRemove.includes(el));

      file.parser.importStatements = statementsToAdd.concat(file.parser.importStatements);
      file.parser.ast.statements = statementsToAdd.concat(file.parser.ast.statements);
      file.parser.ast.statements = file.parser.ast.statements.filter((el) => !statementsToRemove.includes(el));

      file.parser.statements = file.parser.statements.filter((el) => !statementsToRemove.includes(el));
    }
  }
}
