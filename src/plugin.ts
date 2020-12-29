import { BinaryExpression, CallExpression, CommentStatement, createStringLiteral, createToken, createVisitor, EmptyStatement, ExpressionStatement, isCallExpression, Range, SourceLiteralExpression, TokenKind, VariableExpression, WalkMode } from 'brighterscript';

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
import { TranspileState } from 'brighterscript/dist/parser/TranspileState';

import { LiteralExpression } from 'brighterscript/src/parser/Expression';


let rokuLogConfig: {
  strip: true,
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
  if (entry.file instanceof BrsFile) {

    const parser = entry.file.parser;
    for (let expr of parser.references.functionExpressions) {
      expr.body.walk(createVisitor({
        ExpressionStatement: (es) => {
          let ce = es.expression as CallExpression;
          if (ce) {
            let ve = ce.callee as VariableExpression;
            if (ve) {
              const logMethodRegex = /log(error|warn|info|method|verbose|debug)/i;
              if (logMethodRegex.test(ve.name.text)) {
                if (rokuLogConfig.strip) {
                  return new EmptyStatement();
                } else if (rokuLogConfig.insertPkgPath) {
                  const t = createToken(TokenKind.SourceLocationLiteral, '', ce.range);
                  var sourceExpression = new SourceLiteralExpression(t);
                  if (ce.args.length > 0) {

                    ce.args[0] = new BinaryExpression(sourceExpression, createToken(TokenKind.Plus, '+', ce.range), ce.args[0]);
                  } else {
                    ce.args.push(sourceExpression);
                  }
                }
              }
            }
          }
          // console.log('expr is ', expr);

          // }
        }
      }), { walkMode: WalkMode.visitAllRecursive});
    }
  }
}
