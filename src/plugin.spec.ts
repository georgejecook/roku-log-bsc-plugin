/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { Program, ProgramBuilder, util } from 'brighterscript';
import { expect } from 'chai';
import PluginInterface from 'brighterscript/dist/PluginInterface';
import { standardizePath as s } from './utils/Utils';
import * as fsExtra from 'fs-extra';
let tmpPath = s`${process.cwd()}/.tmp/test`.replace(/\\/g, '/');
let _rootDir = s`${tmpPath}/rootDir`;
let _stagingFolderPath = s`${tmpPath}/staging`;
import undent from 'undent';
import { RokuLogPlugin } from './plugin';

describe('Roku Log Plugin', () => {
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
        fsExtra.emptyDirSync(tmpPath);
        fsExtra.ensureDirSync(_stagingFolderPath);
        fsExtra.ensureDirSync(_rootDir);

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
        fsExtra.emptyDirSync(tmpPath);
        builder.dispose();
        program.dispose();
    });

    describe('basic tests', () => {
        it('strips logs', async () => {
            program.setFile('source/test.spec.bs', `
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
            expect(
                getContents('test.spec.brs')
            ).to.equal(`function f1()





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
        });

        it('updates log lines', async () => {
            program.setFile('source/test.spec.bs', `
                function f1()
                    m.log.info("i")
                    m.log.warn("w")
                    m.log.error("e")
                    m.log.verbose("v")
                    m.log.method("v")
                    m.log.increaseIndent()
                    m.log.decreaseIndent()
                    m.log.resetIndent()
                end function

                namespace ns
                    function ns1()
                        m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        m.log.verbose("v")
                        m.log.method("v")
                        m.log.increaseIndent()
                        m.log.decreaseIndent()
                        m.log.resetIndent()
                    end function
                    class c1
                        function cm()
                            m.log.info("i")
                            m.log.warn("w")
                            m.log.error("e")
                            m.log.verbose("v")
                            m.log.method("v")
                            m.log.increaseIndent()
                            m.log.decreaseIndent()
                            m.log.resetIndent()
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
                        m.log.increaseIndent()
                        m.log.decreaseIndent()
                        m.log.resetIndent()
                    end function
                end class
            `);
            program.validate();
            plugin.rokuLogConfig.strip = false;
            plugin.rokuLogConfig.insertPkgPath = true;
            await builder.transpile();
            //linux tests end up with too many slashes, so remove one to make the test happy
            const tmpDir = tmpPath.replace(/^\//, '');
            expect(
                getContents('test.spec.brs').replace(/\/\/\/(.*)\/rootDir/gim, '')
            ).to.equal(
                undent`
function f1()
    m.log.info("file" + ":/source/test.spec.bs:3", "i")
    m.log.warn("file" + ":/source/test.spec.bs:4", "w")
    m.log.error("file" + ":/source/test.spec.bs:5", "e")
    m.log.verbose("file" + ":/source/test.spec.bs:6", "v")
    m.log.method("file" + ":/source/test.spec.bs:7", "v")
    m.log.increaseIndent()
    m.log.decreaseIndent()
    m.log.resetIndent()
end function
function ns_ns1()
    m.log.info("file" + ":/source/test.spec.bs:15", "i")
    m.log.warn("file" + ":/source/test.spec.bs:16", "w")
    m.log.error("file" + ":/source/test.spec.bs:17", "e")
    m.log.verbose("file" + ":/source/test.spec.bs:18", "v")
    m.log.method("file" + ":/source/test.spec.bs:19", "v")
    m.log.increaseIndent()
    m.log.decreaseIndent()
    m.log.resetIndent()
end function
function __ns_c1_builder()
    instance = {}
    instance.new = sub()
    end sub
    instance.cm = function()
        m.log.info("file" + ":/source/test.spec.bs:26", "i")
        m.log.warn("file" + ":/source/test.spec.bs:27", "w")
        m.log.error("file" + ":/source/test.spec.bs:28", "e")
        m.log.verbose("file" + ":/source/test.spec.bs:29", "v")
        m.log.method("file" + ":/source/test.spec.bs:30", "v")
        m.log.increaseIndent()
        m.log.decreaseIndent()
        m.log.resetIndent()
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
        m.log.info("file" + ":/source/test.spec.bs:39", "i")
        m.log.warn("file" + ":/source/test.spec.bs:40", "w")
        m.log.error("file" + ":/source/test.spec.bs:41", "e")
        m.log.verbose("file" + ":/source/test.spec.bs:42", "v")
        m.log.method("file" + ":/source/test.spec.bs:43", "v")
        m.log.increaseIndent()
        m.log.decreaseIndent()
        m.log.resetIndent()
    end function
    return instance
end function
function c2()
    instance = __c2_builder()
    instance.new()
    return instance
end function`.replace(/\/\/\/(.*)\/rootDir/gim, ''));
        });

        it('leaves comments', async () => {
            program.setFile('source/test.spec.bs', `
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

            expect(
                getContents('test.spec.brs')
            ).to.equal(undent`
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
        });
        it('removes comments', async () => {
            program.setFile('source/test.spec.bs', `
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

            expect(
                getContents('test.spec.brs')
            ).to.equal(undent`
function f1()

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
        });
        it('removes comments and strips', async () => {
            program.setFile('source/test.spec.bs', `
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

            expect(
                getContents('test.spec.brs')
            ).to.equal(undent`
function f1()






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
end function
`);
        });

        it('sets m.__le value when guarding is active', async () => {
            program.setFile('source/test.spec.bs', `
                'mock logger
                namespace log
                    class Logger
                        function new(name as string)
                        end function
                    end class
                end namespace

                'comp scope
                function f1()
                    'test comment here
                    m.log = new log.Logger("TestComp")
                    m.log.info("v")
                end function

                'class scope
                namespace ns
                    class TestClass
                    function f1()
                        m.log = new log.Logger("TestClass")
                        m.log.info("v")
                    end function
                    end class
                end namespace
            `);
            program.validate();
            plugin.rokuLogConfig.strip = false;
            plugin.rokuLogConfig.guard = true;
            plugin.rokuLogConfig.insertPkgPath = false;
            plugin.rokuLogConfig.removeComments = true;
            await builder.transpile();
            expect(
                getContents('test.spec.brs')
            ).to.equal(undent`
            function __log_Logger_builder()
                instance = {}
                instance.new = function(name as string)
                end function
                return instance
            end function
            function log_Logger(name as string)
                instance = __log_Logger_builder()
                instance.new(name)
                return instance
            end function


            function f1()

                m.log = log_Logger("TestComp")
                m.__le = m.log.enabled
                if m.__le = true
                    m.log.info("v")
                end if
            end function

            function __ns_TestClass_builder()
                instance = {}
                instance.new = sub()
                end sub
                instance.f1 = function()
                    m.log = log_Logger("TestClass")
                    m.__le = m.log.enabled
                    if m.__le = true
                        if m.__le = true
                            if m.__le = true
                                m.log.info("v")
                            end if
                        end if
                    end if
                end function
                return instance
            end function
            function ns_TestClass()
                instance = __ns_TestClass_builder()
                instance.new()
                return instance
            end function`);
        });

        it('guards log calls', async () => {
            program.setFile('source/test.spec.bs', `
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
            plugin.rokuLogConfig.guard = true;
            plugin.rokuLogConfig.insertPkgPath = false;
            plugin.rokuLogConfig.removeComments = true;
            await builder.transpile();
            expect(
                getContents('test.spec.brs')
            ).to.equal(undent`
            function f1()

                if m.__le = true
                    m.log.info("i")
                end if
                if m.__le = true
                    m.log.warn("w")
                end if
                if m.__le = true
                    m.log.error("e")
                end if
                if m.__le = true
                    m.log.verbose("v")
                end if
                if m.__le = true
                    m.log.method("v")
                end if
            end function

            function ns_ns1()

                if m.__le = true
                    if m.__le = true
                        m.log.info("i")
                    end if
                end if
                if m.__le = true
                    if m.__le = true
                        m.log.warn("w")
                    end if
                end if
                if m.__le = true
                    if m.__le = true
                        m.log.error("e")
                    end if
                end if
                if m.__le = true
                    if m.__le = true
                        m.log.verbose("v")
                    end if
                end if
                if m.__le = true
                    if m.__le = true
                        m.log.method("v")
                    end if
                end if
            end function

            function __ns_c1_builder()
                instance = {}
                instance.new = sub()
                end sub

                instance.cm = function()

                    if m.__le = true
                        if m.__le = true
                            if m.__le = true
                                m.log.info("i")
                            end if
                        end if
                    end if
                    if m.__le = true
                        if m.__le = true
                            if m.__le = true
                                m.log.warn("w")
                            end if
                        end if
                    end if
                    if m.__le = true
                        if m.__le = true
                            if m.__le = true
                                m.log.error("e")
                            end if
                        end if
                    end if
                    if m.__le = true
                        if m.__le = true
                            if m.__le = true
                                m.log.verbose("v")
                            end if
                        end if
                    end if
                    if m.__le = true
                        if m.__le = true
                            if m.__le = true
                                m.log.method("v")
                            end if
                        end if
                    end if
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
                    if m.__le = true
                        if m.__le = true
                            m.log.info("i")
                        end if
                    end if
                    if m.__le = true
                        if m.__le = true
                            m.log.warn("w")
                        end if
                    end if
                    if m.__le = true
                        if m.__le = true
                            m.log.error("e")
                        end if
                    end if


                    if m.__le = true
                        if m.__le = true
                            m.log.verbose("v")
                        end if
                    end if
                    if m.__le = true
                        if m.__le = true
                            m.log.method("v")
                        end if
                    end if
                end function
                return instance
            end function
            function c2()
                instance = __c2_builder()
                instance.new()
                return instance
            end function`);
        });
    });
});

function getContents(filename: string): string {
    return undent(
        fsExtra.readFileSync(s`${_stagingFolderPath}/source/${filename}`).toString()
    );
}
