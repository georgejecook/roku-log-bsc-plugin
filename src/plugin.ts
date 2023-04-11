import type { AfterFileTranspileEvent, BeforeFileTranspileEvent, CallExpression, CompilerPlugin, ExpressionStatement, NewExpression, Program, ProgramBuilder, TranspileObj } from 'brighterscript';
import { DottedSetStatement, BinaryExpression, createIdentifier, createStringLiteral, DottedGetExpression, isCallExpression, isExpressionStatement, isNewExpression, LiteralExpression, ParseMode, Range, VariableExpression } from 'brighterscript';

import * as brighterscript from 'brighterscript';
import { BrsTranspileState } from 'brighterscript/dist/parser/BrsTranspileState';

import * as fs from 'fs-extra';
import { RawCodeStatement } from './RawCodeStatement';
import { createIfStatement } from './utils/Utils';


export class RokuLogPlugin implements CompilerPlugin {
    public name = 'log-plugin';
    public rokuLogConfig = {
        strip: true,
        guard: false,
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
        if (brighterscript.isBrsFile(event.file)) {
            const parser = event.file.parser;
            let logVisitor = brighterscript.createVisitor({
                DottedSetStatement: (expressionStatement, parentNode, owner, key) => {
                    if (!visitedLineNumbers[`${expressionStatement.range.start.line}`]) {
                        if (isNewExpression(expressionStatement.value)) {
                            let newExpression = expressionStatement.value;
                            if (newExpression.className.getName(ParseMode.BrighterScript) === 'log.Logger') {
                                let guardExpression = this.createGuardSetStatement(newExpression);
                                event.editor.addToArray(owner, key + 1, guardExpression);
                            }
                        }
                        visitedLineNumbers[`${expressionStatement.range.start.line}`] = true;
                    }
                },
                ExpressionStatement: (expressionStatement, parentNode, owner, key) => {

                    if (isCallExpression(expressionStatement.expression)) {
                        let callExpression = expressionStatement.expression;
                        if (brighterscript.isDottedGetExpression(callExpression.callee) &&
                            brighterscript.isDottedGetExpression(callExpression.callee.obj) &&
                            callExpression.callee.obj.name.text === 'log' &&
                            brighterscript.isVariableExpression(callExpression.callee.obj.obj) &&
                            callExpression.callee.obj.obj.name.text === 'm') {
                            if (!visitedLineNumbers[`${callExpression.range.start.line}`]) {
                                try {
                                    if (this.rokuLogConfig.strip) {
                                        event.editor.overrideTranspileResult(callExpression, '');
                                    } else {
                                        if (this.rokuLogConfig.insertPkgPath) {
                                            let funcName = callExpression.callee.name.text;
                                            if (funcName === 'info' || funcName === 'verbose' || funcName === 'error' || funcName === 'warn' || funcName === 'debug' || funcName === 'method') {
                                                const t = brighterscript.createToken(brighterscript.TokenKind.SourceLocationLiteral, '', callExpression.range);
                                                let sourceExpression = new brighterscript.SourceLiteralExpression(t);
                                                if (callExpression.args.length > 0) {
                                                    event.editor.addToArray(callExpression.args, 0, sourceExpression);
                                                } else {
                                                    event.editor.addToArray(callExpression.args, callExpression.args.length, sourceExpression);
                                                }
                                            }
                                            visitedLineNumbers[`${callExpression.range.start.line}`] = true;
                                        }
                                        if (this.rokuLogConfig.guard && isExpressionStatement(callExpression.parent)) {
                                            event.editor.setProperty(owner, key, this.createGuardStatement(callExpression));
                                        }
                                    }
                                } catch (e) {
                                    console.log(`Error parsing file: ${event.file.pkgPath} ${e.getMessage()}`);
                                }
                            }
                        }
                    }
                }
            });
            for (let expr of parser.references.functionExpressions) {
                expr.body.walk(logVisitor, { walkMode: brighterscript.WalkMode.visitAllRecursive });
            }
            for (let expr of parser.references.classStatements) {
                expr.walk(logVisitor, { walkMode: brighterscript.WalkMode.visitAllRecursive });
            }
            for (let expr of parser.references.namespaceStatements) {
                expr.walk(logVisitor, { walkMode: brighterscript.WalkMode.visitAllRecursive });
            }
        }
    }

    createGuardSetStatement(callExpression: NewExpression): any {
        let nameIdentifier2 = createIdentifier('enabled', callExpression.range);
        let nameIdentifier = createIdentifier('log', callExpression.range);
        let objIdentifier = createIdentifier('m', callExpression.range);
        let obj = new VariableExpression(objIdentifier);
        let dottedGet = new DottedGetExpression(obj, nameIdentifier, brighterscript.createToken(brighterscript.TokenKind.Dot, '.', callExpression.range));
        let dottedGet2 = new DottedGetExpression(dottedGet, nameIdentifier2, brighterscript.createToken(brighterscript.TokenKind.Dot, '.', callExpression.range));


        let setNameIdentifier = createIdentifier('__le', callExpression.range);
        let setObjIdentifier = createIdentifier('m', callExpression.range);
        let setObj = new VariableExpression(setObjIdentifier);
        let dottedSet = new DottedSetStatement(setObj, setNameIdentifier, dottedGet2);
        return dottedSet;
    }

    createGuardStatement(callExpression: CallExpression): any {
        let nameIdentifier = createIdentifier('__le', callExpression.range);
        let objIdentifier = createIdentifier('m', callExpression.range);
        let obj = new VariableExpression(objIdentifier);
        let dottedGet = new DottedGetExpression(obj, nameIdentifier, brighterscript.createToken(brighterscript.TokenKind.Dot, '.', callExpression.range));
        let trueExpression = new LiteralExpression(brighterscript.createToken(brighterscript.TokenKind.True, 'true', callExpression.range));
        let binaryExpression = new BinaryExpression(dottedGet, brighterscript.createToken(brighterscript.TokenKind.Equal, '=', callExpression.range), trueExpression);
        return createIfStatement(binaryExpression, [callExpression.parent as ExpressionStatement]);
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

