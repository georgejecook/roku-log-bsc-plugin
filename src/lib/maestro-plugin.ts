import {
  BrsFile,
  CompilerPlugin,
  FileObj,
  Program,
  ProgramBuilder,
  SourceObj,
  Util,
  XmlFile,
} from 'brighterscript';

import { ProjectFileMap } from './fileProcessing/ProjectFileMap';

import { BindingProcessor } from './bindingSupport/BindingProcessor';
import { File } from './fileProcessing/File';

import { FileType } from './fileProcessing/FileType';
import ImportProcessor from './importSupport/ImportProcessor';
import { getAssociatedFile } from './utils/Utils';

let _builder: ProgramBuilder;
let fileMap: ProjectFileMap;
let bindingProcessor: BindingProcessor;
let importProcessor: ImportProcessor;

function beforeProgramCreate(builder: ProgramBuilder): void {
  fileMap = new ProjectFileMap();
  bindingProcessor = new BindingProcessor(fileMap);
  importProcessor = new ImportProcessor(builder.options);
  _builder = builder;
}

// entry point
const pluginInterface: CompilerPlugin = {
  name: 'maestroPlugin',
  beforeProgramCreate: beforeProgramCreate,
  beforePublish: beforePublish,
  beforeFileParse: beforeFileParse,
  afterFileParse: afterFileParse,
  afterProgramValidate: afterProgramValidate
};

export default pluginInterface;

let util = new Util();
function beforeFileParse(source: SourceObj): void {
  // pull out the bindings and store them in a maestro file
  // remove the illegal xml from the source
  let file = new File(source.pathAbsolute, source.source);
  fileMap.addFile(file);
  if (file.fileType === FileType.Xml) {
    bindingProcessor.parseBindings(file);
    source.source = file.getFileContents();
  }
}

function afterFileParse(file: (BrsFile | XmlFile)): void {
  let mFile = fileMap.allFiles.get(file.pathAbsolute);
  //look up the maestro file and link it
  if (mFile) {
    mFile.bscFile = file;

    //add alternateFile, if we're xml
    if (file instanceof XmlFile) {
      let associatedFile = getAssociatedFile(file, fileMap);
      if (associatedFile) {
        mFile.associatedFile = associatedFile;
        associatedFile.associatedFile = mFile;
      }
    } else if (file instanceof BrsFile) {
      importProcessor.processDynamicImports(file);
    }
  } else {
    console.error(`could no2t find maestro file for bc file at path ${file.pathAbsolute}`);
  }
}

function afterProgramValidate(program: Program) {
  for (let compFile of [...fileMap.allXMLComponentFiles.values()]) {
    if (compFile.bscFile) {
      compFile.parentFile = fileMap.allXMLComponentFiles.get(compFile.parentComponentName);
      bindingProcessor.validateBindings(compFile);
      compFile.bscFile.addDiagnostics(compFile.diagnostics);
    }
  }
}

function beforePublish(builder: ProgramBuilder, files: FileObj[]): void {
  for (let compFile of [...fileMap.allXMLComponentFiles.values()]) {
    if (compFile.bscFile) {
      bindingProcessor.generateCodeForXMLFile(compFile);
    }
  }
}
