import { BinaryExpression, CallExpression, CompilerPlugin, createToken, createVisitor, EmptyStatement, isBrsFile, Program, SourceLiteralExpression, TokenKind, VariableExpression, WalkMode } from 'brighterscript';

import {
  ProgramBuilder,
  TranspileObj,
} from 'brighterscript';


let rokuLogConfig: {
  strip: true,
  insertPkgPath: true
};

class RokuLogPlugin implements CompilerPlugin {
  public name = 'log-plugin';

  beforeProgramCreate(builder: ProgramBuilder): void {
    rokuLogConfig = (builder.options as any).rokuLog || {
      strip: false,
      insertPkgPath: true
    };
  }

  beforeProgramTranspile(program: Program, entries: TranspileObj[]) {
    for (let filePath in program.files) {
      let file = program.files[filePath];
      file.needsTranspiled = true;
    }
  }

  beforeFileTranspile(entry: TranspileObj) {
    if (isBrsFile(entry.file)) {
      const parser = entry.file.parser;
      // console.log('>>>', entry.file);
      for (let expr of parser.references.functionExpressions) {
        expr.body.walk(createVisitor({
          ExpressionStatement: (es) => {

            let ce = es.expression as CallExpression;
            if (ce) {
              let ve = ce.callee as VariableExpression;
              if (ve) {
                const logMethodRegex = /log(error|warn|info|method|verbose|debug)/i;
                try {
                  if (ve.name && logMethodRegex.test(ve.name.text)) {
                    if (rokuLogConfig.strip) {
                      return new EmptyStatement();
                    } else if (rokuLogConfig.insertPkgPath) {
                      const t = createToken(TokenKind.SourceLocationLiteral, '', ce.range);
                      var sourceExpression = new SourceLiteralExpression(t);

                      if (ce.args.length > 0) {
                        ce.args[0] = new BinaryExpression(sourceExpression, createToken(TokenKind.Plus, '+ " " + ', ce.range), ce.args[0]);
                      } else {
                        ce.args.push(sourceExpression);
                      }
                    }
                  }
                } catch (e) {
                  console.log(`Error parsing file: ${entry.file.pkgPath} ${e.getMessage()}`);
                }
              }
            }
            return es;
          }
        }), { walkMode: WalkMode.visitAllRecursive });
      }
    }
  }
}

export default function () {
  return new RokuLogPlugin();
}