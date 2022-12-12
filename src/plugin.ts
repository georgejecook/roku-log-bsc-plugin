import type { AfterFileTranspileEvent, BeforeFileTranspileEvent, CompilerPlugin, Program, ProgramBuilder, TranspileObj } from 'brighterscript';

import { isDottedGetExpression, isVariableExpression, createToken, createVisitor, isBrsFile, SourceLiteralExpression, TokenKind, WalkMode } from 'brighterscript';
import { BrsTranspileState } from 'brighterscript/dist/parser/BrsTranspileState';

import * as fs from 'fs-extra';
import { RawCodeStatement } from './RawCodeStatement';


export class RokuLogPlugin implements CompilerPlugin {
    public name = 'log-plugin';
    public rokuLogConfig = {
        strip: true,
        guard: true,
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

    beforeFileTranspile(event: BeforeFileTranspileEvent) {
        let visitedLineNumbers = {};
        if (isBrsFile(event.file)) {
            let state = new BrsTranspileState(event.file);
            const parser = event.file.parser;
            let logVisitor = createVisitor({
                CallExpression: (callExpression, parentNode, owner, key) => {
                    if (isDottedGetExpression(callExpression.callee) &&
                        isDottedGetExpression(callExpression.callee.obj) &&
                        callExpression.callee.obj.name.text === 'log' &&
                        isVariableExpression(callExpression.callee.obj.obj) &&
                        callExpression.callee.obj.obj.name.text === 'm') {
                        if (!visitedLineNumbers[`${callExpression.range.start.line}`]) {
                            try {
                                if (this.rokuLogConfig.strip) {
                                    event.editor.overrideTranspileResult(callExpression, '');
                                } else {
                                    if (this.rokuLogConfig.insertPkgPath) {
                                        let funcName = callExpression.callee.name.text;
                                        if (funcName === 'info' || funcName === 'verbose' || funcName === 'error' || funcName === 'warn' || funcName === 'debug' || funcName === 'method') {
                                            const t = createToken(TokenKind.SourceLocationLiteral, '', callExpression.range);
                                            let sourceExpression = new SourceLiteralExpression(t);
                                            if (callExpression.args.length > 0) {
                                                event.editor.addToArray(callExpression.args, 0, sourceExpression);
                                            } else {
                                                event.editor.addToArray(callExpression.args, callExpression.args.length, sourceExpression);
                                            }
                                        }
                                        visitedLineNumbers[`${callExpression.range.start.line}`] = true;
                                    }
                                    if (this.rokuLogConfig.guard) {
                                        event.editor.setProperty(owner, key, new RawCodeStatement(`if m.__le = true then ${callExpression.transpile(state)}`));
                                    }
                                }
                            } catch (e) {
                                console.log(`Error parsing file: ${event.file.pkgPath} ${e.getMessage()}`);
                            }
                        }
                        return callExpression;
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

    afterFileTranspile(event: AfterFileTranspileEvent) {
        if (this.rokuLogConfig.removeComments) {
            let text = event.code;
            if (event.outputPath.endsWith('.xml')) {
                text = text.replace(/<!(--.*?--)?>/gim, '');
            } else {
                text = text.replace(/^(?: *|\t*)('[^\n]*)/gim, '');
            }
            event.code = text;
        }
    }

}

export default () => {
    return new RokuLogPlugin();
};
