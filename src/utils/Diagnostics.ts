import { DiagnosticSeverity, Range, BrsFile, XmlFile } from 'brighterscript';

function addErrorDiagnostic(
  file: BrsFile,
  code: number,
  message: string,
  startLine: number = 0,
  startCol: number = 0,
  endLine: number = -1,
  endCol: number = 99999
) {
  endLine = endLine === -1 ? startLine : endLine;
  file.addDiagnostics([createDiagnostic(file, code, message, startLine, startCol, endLine, endCol, DiagnosticSeverity.Error)]);
}

function createDiagnostic(
  bscFile: BrsFile | XmlFile,
  code: number,
  message: string,
  startLine: number = 0,
  startCol: number = 99999,
  endLine: number = 0,
  endCol: number = 99999,
  severity: DiagnosticSeverity = DiagnosticSeverity.Error
) {
  const diagnostic = {
    code: code,
    message: message,
    range: Range.create(startLine, startCol, endLine, endCol),
    file: bscFile,
    severity: severity
  };
  return diagnostic;
}
