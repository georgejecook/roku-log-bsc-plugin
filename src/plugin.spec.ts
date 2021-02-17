/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { Program, ProgramBuilder, util } from 'brighterscript';
import { expect } from 'chai';
import PluginInterface from 'brighterscript/dist/PluginInterface';
import { standardizePath as s } from './utils/Utils';
import * as fsExtra from 'fs-extra';
let tmpPath = s`${process.cwd()}/tmp`;
let _rootDir = s`${tmpPath}/rootDir`;
let _stagingFolderPath = s`${tmpPath}/staging`;

import { trimLeading } from './utils/testHelpers.spec';
import { RokuLogPlugin } from './plugin';

describe('RooibosPlugin', () => {
    let program: Program;
    let builder: ProgramBuilder;
    let plugin: RokuLogPlugin;
    let options;
    beforeEach(() => {
        plugin = new RokuLogPlugin();
        options = {
            rootDir: _rootDir,
            stagingFolderPath: _stagingFolderPath
        };
        fsExtra.ensureDirSync(_stagingFolderPath);
        fsExtra.ensureDirSync(_rootDir);
        fsExtra.ensureDirSync(tmpPath);

        builder = new ProgramBuilder();
        builder.options = util.normalizeAndResolveConfig(options);
        builder.program = new Program(builder.options);
        program = builder.program;
        builder.plugins = new PluginInterface([plugin], undefined);
        program.plugins = new PluginInterface([plugin], undefined);
        program.createSourceScope(); //ensure source scope is created
        plugin.beforeProgramCreate(builder);
    });
    afterEach(() => {
        fsExtra.ensureDirSync(tmpPath);
        fsExtra.emptyDirSync(tmpPath);
        builder.dispose();
        program.dispose();
    });

    describe('basic tests', () => {
        it('strips logs', async () => {
            program.addOrReplaceFile('source/test.spec.bs', `
                function f1()
                    m.log.info("i")
                    m.log.warn("w")
                    m.log.error("e")
                    m.log.verbose("v")
                    m.log.method("v")
                end function

                namespace ns
                    function ns1()
                        m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                    class c1
                        function cm()
                            m.log.info("i")
                            m.log.warn("w")
                            m.log.error("e")
                            m.log.verbose("v")
                            m.log.method("v")
                        end function
                    end class
                end namespace
                class c2
                    function cm()
                        m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                end class
            `);
            program.validate();
            await builder.transpile();

            let a = getContents('test.spec.brs');
            let b = trimLeading(`function f1()





            end function
            function ns_ns1()





            end function
            function __ns_c1_builder()
            instance = {}
            instance.new = sub()
            end sub
            instance.cm = function()





            end function
            return instance
            end function
            function ns_c1()
            instance = __ns_c1_builder()
            instance.new()
            return instance
            end function
            function __c2_builder()
            instance = {}
            instance.new = sub()
            end sub
            instance.cm = function()





            end function
            return instance
            end function
            function c2()
            instance = __c2_builder()
            instance.new()
            return instance
            end function`);
            expect(a).to.equal(b);
        });

        it('updates log lines', async () => {
            program.addOrReplaceFile('source/test.spec.bs', `
                function f1()
                    m.log.info("i")
                    m.log.warn("w")
                    m.log.error("e")
                    m.log.verbose("v")
                    m.log.method("v")
                end function

                namespace ns
                    function ns1()
                        m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                    class c1
                        function cm()
                            m.log.info("i")
                            m.log.warn("w")
                            m.log.error("e")
                            m.log.verbose("v")
                            m.log.method("v")
                        end function
                    end class
                end namespace
                class c2
                    function cm()
                        m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                end class
            `);
            program.validate();
            plugin.rokuLogConfig.strip = false;
            plugin.rokuLogConfig.insertPkgPath = true;
            await builder.transpile();

            let a = getContents('test.spec.brs');
            let b = trimLeading(`function f1()
            m.log.info("FILE_PATH:3", "i")
            m.log.warn("FILE_PATH:4", "w")
            m.log.error("FILE_PATH:5", "e")
            m.log.verbose("FILE_PATH:6", "v")
            m.log.method("FILE_PATH:7", "v")
            end function
            function ns_ns1()
            m.log.info("FILE_PATH:12", "i")
            m.log.warn("FILE_PATH:13", "w")
            m.log.error("FILE_PATH:14", "e")
            m.log.verbose("FILE_PATH:15", "v")
            m.log.method("FILE_PATH:16", "v")
            end function
            function __ns_c1_builder()
            instance = {}
            instance.new = sub()
            end sub
            instance.cm = function()
            m.log.info("FILE_PATH:20", "i")
            m.log.warn("FILE_PATH:21", "w")
            m.log.error("FILE_PATH:22", "e")
            m.log.verbose("FILE_PATH:23", "v")
            m.log.method("FILE_PATH:24", "v")
            end function
            return instance
            end function
            function ns_c1()
            instance = __ns_c1_builder()
            instance.new()
            return instance
            end function
            function __c2_builder()
            instance = {}
            instance.new = sub()
            end sub
            instance.cm = function()
            m.log.info("FILE_PATH:30", "i")
            m.log.warn("FILE_PATH:31", "w")
            m.log.error("FILE_PATH:32", "e")
            m.log.verbose("FILE_PATH:33", "v")
            m.log.method("FILE_PATH:34", "v")
            end function
            return instance
            end function
            function c2()
            instance = __c2_builder()
            instance.new()
            return instance
            end function`);

            expect(normalizePaths(a)).to.equal(normalizePaths(b));
        });

        it('leaves comments', async () => {
            program.addOrReplaceFile('source/test.spec.bs', `
'test comment here
function f1()
            'test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function

            '     test comment here
            namespace ns
            function ns1()
            '     test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function
            '     test comment here
            class c1
            '     test comment here
            function cm()
            '     test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
                            m.log.verbose("v")
                            m.log.method("v")
                            end function
                            end class
                end namespace
                class c2
                function cm()
                m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        '     test comment here
                        '     test comment here
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                end class
                `);
            program.validate();
            plugin.rokuLogConfig.strip = false;
            plugin.rokuLogConfig.insertPkgPath = false;
            plugin.rokuLogConfig.removeComments = false;
            await builder.transpile();

            let a = getContents('test.spec.brs');
            let b = trimLeading(`'test comment here
            function f1()
            'test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function
            '     test comment here
            function ns_ns1()
            '     test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function
            '     test comment here
            function __ns_c1_builder()
            instance = {}
            instance.new = sub()
            end sub
            '     test comment here
            instance.cm = function()
            '     test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function
            return instance
            end function
            function ns_c1()
            instance = __ns_c1_builder()
            instance.new()
            return instance
            end function
            function __c2_builder()
            instance = {}
            instance.new = sub()
            end sub
            instance.cm = function()
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            '     test comment here
            '     test comment here
            m.log.verbose("v")
            m.log.method("v")
            end function
            return instance
            end function
            function c2()
            instance = __c2_builder()
            instance.new()
            return instance
            end function`);

            expect(normalizePaths(a)).to.equal(normalizePaths(b));
        });
        it('removes comments', async () => {
            program.addOrReplaceFile('source/test.spec.bs', `
'test comment here
function f1()
            'test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function

            '     test comment here
            namespace ns
            function ns1()
            '     test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function
            '     test comment here
            class c1
            '     test comment here
            function cm()
            '     test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
                            m.log.verbose("v")
                            m.log.method("v")
                            end function
                            end class
                end namespace
                class c2
                function cm()
                m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        '     test comment here
                        '     test comment here
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                end class
                `);
            program.validate();
            plugin.rokuLogConfig.strip = false;
            plugin.rokuLogConfig.insertPkgPath = false;
            plugin.rokuLogConfig.removeComments = true;
            await builder.transpile();

            let a = getContents('test.spec.brs');
            let b = trimLeading(`function f1()

            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function

            function ns_ns1()

            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function

            function __ns_c1_builder()
            instance = {}
            instance.new = sub()
            end sub

            instance.cm = function()

            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function
            return instance
            end function
            function ns_c1()
            instance = __ns_c1_builder()
            instance.new()
            return instance
            end function
            function __c2_builder()
            instance = {}
            instance.new = sub()
            end sub
            instance.cm = function()
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")


            m.log.verbose("v")
            m.log.method("v")
            end function
            return instance
            end function
            function c2()
            instance = __c2_builder()
            instance.new()
            return instance
            end function`);

            expect(normalizePaths(a)).to.equal(normalizePaths(b));
        });
        it('removes comments and strips', async () => {
            program.addOrReplaceFile('source/test.spec.bs', `
'test comment here
function f1()
            'test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function

            '     test comment here
            namespace ns
            function ns1()
            '     test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
            m.log.verbose("v")
            m.log.method("v")
            end function
            '     test comment here
            class c1
            '     test comment here
            function cm()
            '     test comment here
            m.log.info("i")
            m.log.warn("w")
            m.log.error("e")
                            m.log.verbose("v")
                            m.log.method("v")
                            end function
                            end class
                end namespace
                class c2
                function cm()
                m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        '     test comment here
                        '     test comment here
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                end class
                `);
            program.validate();
            plugin.rokuLogConfig.strip = true;
            plugin.rokuLogConfig.insertPkgPath = false;
            plugin.rokuLogConfig.removeComments = true;
            await builder.transpile();

            let a = getContents('test.spec.brs');
            let b = trimLeading(`function f1()






            end function

            function ns_ns1()






            end function

            function __ns_c1_builder()
            instance = {}
            instance.new = sub()
            end sub

            instance.cm = function()






            end function
            return instance
            end function
            function ns_c1()
            instance = __ns_c1_builder()
            instance.new()
            return instance
            end function
            function __c2_builder()
            instance = {}
            instance.new = sub()
            end sub
            instance.cm = function()







            end function
            return instance
            end function
            function c2()
            instance = __c2_builder()
            instance.new()
            return instance
            end function`);

            expect(normalizePaths(a)).to.equal(normalizePaths(b));
        });
    });

});

function normalizePaths(s: string) {
    return s.replace(/file:.*test.spec.bs/gim, 'FILE_PATH');
}
describe.skip('run a local project', () => {
    it.skip('sanity checks on parsing - only run this outside of ci', () => {
        let programBuilder = new ProgramBuilder();
        programBuilder.run({
            project: '/home/george/hope/applicaster/zapp-roku-app/bsconfig-test.json'
            // project: '/home/george/hope/open-source/maestro/swerve-app/bsconfig-test.json'
        }).catch(e => {
            console.error(e);
        });
    });
});

function getContents(filename: string) {
    return trimLeading(fsExtra.readFileSync(s`${_stagingFolderPath}/source/${filename}`).toString());
}
