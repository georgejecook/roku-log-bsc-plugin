import type { CompilerPlugin, Program, ProgramBuilder, TranspileObj } from 'brighterscript';

import { isDottedGetExpression, isVariableExpression, createToken, createVisitor, EmptyStatement, isBrsFile, SourceLiteralExpression, TokenKind, WalkMode } from 'brighterscript';

import * as fs from 'fs-extra';


export class RokuLogPlugin implements CompilerPlugin {
    public name = 'log-plugin';
    public rokuLogConfig = {
        strip: true,
        insertPkgPath: true,
        removeComments: true
    };

    beforeProgramCreate(builder: ProgramBuilder): void {
        this.rokuLogConfig = { ...this.rokuLogConfig, ...(builder.options as any).rokuLog };
    }

    beforeProgramTranspile(program: Program, entries: TranspileObj[]) {
        for (let filePath in program.files) {
            let file = program.files[filePath];
            file.needsTranspiled = true;
        }
    }

    beforeFileTranspile(entry: TranspileObj) {
        let visitedLineNumbers = {};
        if (isBrsFile(entry.file)) {
            const parser = entry.file.parser;
            let logVisitor = createVisitor({
                CallExpression: (ce) => {
                    if (isDottedGetExpression(ce.callee) &&
                    isDottedGetExpression(ce.callee.obj) &&
                    ce.callee.obj.name.text === 'log' &&
                    isVariableExpression(ce.callee.obj.obj) &&
                    ce.callee.obj.obj.name.text === 'm') {
                        if (!visitedLineNumbers[`${ce.range.start.line}`]) {
                            try {
                                if (this.rokuLogConfig.strip) {
                                    return new EmptyStatement();
                                } else if (this.rokuLogConfig.insertPkgPath) {
                                    const t = createToken(TokenKind.SourceLocationLiteral, '', ce.range);
                                    let sourceExpression = new SourceLiteralExpression(t);
                                    if (ce.args.length > 0) {
                                        ce.args.splice(0, 0, sourceExpression);
                                    } else {
                                        ce.args.push(sourceExpression);
                                    }
                                    visitedLineNumbers[`${ce.range.start.line}`] = true;
                                }
                            } catch (e) {
                                console.log(`Error parsing file: ${entry.file.pkgPath} ${e.getMessage()}`);
                            }
                        }
                        return ce;
                    }
                }
            });
            for (let expr of parser.references.functionExpressions) {
                expr.body.walk(logVisitor, { walkMode: WalkMode.visitAllRecursive });
            }
            for (let expr of parser.references.classStatements) {
                expr.walk(logVisitor, { walkMode: WalkMode.visitAllRecursive });
            }
            for (let expr of parser.references.namespaceStatements) {
                expr.walk(logVisitor, { walkMode: WalkMode.visitAllRecursive });
            }
        }
    }

    afterFileTranspile(entry: TranspileObj) {
        if (this.rokuLogConfig.removeComments) {
            let text = fs.readFileSync(entry.outputPath, 'utf8');
            if (entry.outputPath.endsWith('.xml')) {
                text = text.replace(/<!(--.*?--)?>/gim, '');
            } else {
                text = text.replace(/^(?: *|\t*)('[^\n]*)/gim, '');
            }

            fs.writeFileSync(entry.outputPath, text, 'utf8');
        }
    }
}

export default () => {
    return new RokuLogPlugin();
};
