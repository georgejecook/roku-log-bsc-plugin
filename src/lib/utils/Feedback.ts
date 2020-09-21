import { BrsFile, XmlFile } from 'brighterscript';
import { DiagnosticSeverity, Range } from 'vscode-languageserver';

import { File } from '../fileProcessing/File';

export function addErrorDiagnostic(
  file: File,
  code: number,
  message: string,
  startLine: number = 1,
  startCol: number = 1,
  endLine: number = 1,
  endCol: number = 1
) {
  file.diagnostics.push(createDiagnostic(file.bscFile, code, message, startLine, startCol, endLine, endCol, DiagnosticSeverity.Error));

}

export function addWarnDiagnostic(
  file: File,
  code: number,
  message: string,
  startLine: number = 1,
  startCol: number = 1,
  endLine: number = 1,
  endCol: number = 1
) {
  file.diagnostics.push(createDiagnostic(file.bscFile, code, message, startLine, startCol, endLine, endCol, DiagnosticSeverity.Warning));
}

export function createDiagnostic(
  bscFile: BrsFile | XmlFile,
  code: number,
  message: string,
  startLine: number = 1,
  startCol: number = 1,
  endLine: number = 1,
  endCol: number = 1,
  severity: DiagnosticSeverity = DiagnosticSeverity.Error
) {
  return {
    code: code,
    message: message,
    range: Range.create(startLine, startCol, endLine, endCol),
    file: bscFile,
    severity: severity
  };
}
