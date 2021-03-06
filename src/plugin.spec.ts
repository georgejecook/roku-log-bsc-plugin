/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { Program, ProgramBuilder, util } from 'brighterscript';
import { expect } from 'chai';
import PluginInterface from 'brighterscript/dist/PluginInterface';
import { standardizePath as s } from './utils/Utils';
import * as fsExtra from 'fs-extra';
let tmpPath = s`/tmp/test`;
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        builder.options = util.normalizeAndResolveConfig(options);
        builder.program = new Program(builder.options);
        program = builder.program;
        program.logger = builder.logger;
        builder.plugins = new PluginInterface([plugin], builder.logger);
        program.plugins = new PluginInterface([plugin], builder.logger);
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
            m.log.info("file" + ":///tmp/test/rootDir/source/test.spec.bs:3", "i")
            m.log.warn("file" + ":///tmp/test/rootDir/source/test.spec.bs:4", "w")
            m.log.error("file" + ":///tmp/test/rootDir/source/test.spec.bs:5", "e")
            m.log.verbose("file" + ":///tmp/test/rootDir/source/test.spec.bs:6", "v")
            m.log.method("file" + ":///tmp/test/rootDir/source/test.spec.bs:7", "v")
            end function
            function ns_ns1()
            m.log.info("file" + ":///tmp/test/rootDir/source/test.spec.bs:12", "i")
            m.log.warn("file" + ":///tmp/test/rootDir/source/test.spec.bs:13", "w")
            m.log.error("file" + ":///tmp/test/rootDir/source/test.spec.bs:14", "e")
            m.log.verbose("file" + ":///tmp/test/rootDir/source/test.spec.bs:15", "v")
            m.log.method("file" + ":///tmp/test/rootDir/source/test.spec.bs:16", "v")
            end function
            function __ns_c1_builder()
            instance = {}
            instance.new = sub()
            end sub
            instance.cm = function()
            m.log.info("file" + ":///tmp/test/rootDir/source/test.spec.bs:20", "i")
            m.log.warn("file" + ":///tmp/test/rootDir/source/test.spec.bs:21", "w")
            m.log.error("file" + ":///tmp/test/rootDir/source/test.spec.bs:22", "e")
            m.log.verbose("file" + ":///tmp/test/rootDir/source/test.spec.bs:23", "v")
            m.log.method("file" + ":///tmp/test/rootDir/source/test.spec.bs:24", "v")
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
            m.log.info("file" + ":///tmp/test/rootDir/source/test.spec.bs:30", "i")
            m.log.warn("file" + ":///tmp/test/rootDir/source/test.spec.bs:31", "w")
            m.log.error("file" + ":///tmp/test/rootDir/source/test.spec.bs:32", "e")
            m.log.verbose("file" + ":///tmp/test/rootDir/source/test.spec.bs:33", "v")
            m.log.method("file" + ":///tmp/test/rootDir/source/test.spec.bs:34", "v")
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

function getContents(filename: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return trimLeading(fsExtra.readFileSync(s`${_stagingFolderPath}/source/${filename}`).toString());
}
