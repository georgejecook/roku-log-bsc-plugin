import { CallExpression, createVisitor, EmptyStatement, ExpressionStatement, isCallExpression, VariableExpression } from 'brighterscript';

import {
  BrsFile,
  CompilerPlugin,
  FileObj,
  Program,
  ProgramBuilder,
  SourceObj,
  TranspileObj,
  Util,
  XmlFile,
} from 'brighterscript';


let rokuLogConfig: {
  strip: false,
  insertPkgPath: true
};

function beforeProgramCreate(builder: ProgramBuilder): void {
  rokuLogConfig = (builder.options as any).rokuLog || {
    strip: false,
    insertPkgPath: true
  };
}

// entry point
const pluginInterface: CompilerPlugin = {
  name: 'login-plugin',
  beforeProgramCreate: beforeProgramCreate,
  beforeFileTranspile: beforeFileTranspile,
};

export default pluginInterface;

function beforeFileTranspile(entry: TranspileObj) {
  // if (entry.file instanceof BrsFile) {

  const parser = entry.file.parser;
  for (let expr of parser.references.functionExpressions) {
    expr.body.walk(createVisitor({
      ExpressionStatement: (es) => {
        es.walk(createVisitor({
          CallExpression: (ec) => {
            let v = ec.callee as any as VariableExpression;
            console.log('ec ', ec);
          }
        }), { walkExpressions: true });
        if (isCallExpression(es.expression as any)) {

        }
        if (es.expression instanceof CallExpression) {
          //   let expr = es.expression as CallExpression;
          //         let v = expr.callee as VariableExpression;
          //         let name = v.name.text;
          //         console.log('name', name);
          //         if (name === 'logInfo' || name === 'logWarn' || name === 'logError') {
          //           if (rokuLogConfig.strip) {
          //             return new EmptyStatement();
          //           } else if (rokuLogConfig.insertPkgPath) {
          //             if (expr.args.length > 0) {
          //               //update first arg
          //             } else {
          //               //add an arg
          //             }
          //           }
          //         }
        }
        // console.log('expr is ', expr);

        // }
      }
    }), {
      walkStatements: true
    });
  }
}
