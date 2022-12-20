/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import type { BsConfig } from 'brighterscript';
import { ProgramBuilder, util } from 'brighterscript';
import { expect } from 'chai';
import { standardizePath as s } from './utils/Utils';
import * as fsExtra from 'fs-extra';
import undent from 'undent';
import { RokuLogPlugin } from './plugin';

const tmpDir = s`${process.cwd()}/.tmp/test`.replace(/\\/g, '/');
const rootDir = s`${tmpDir}/rootDir`;
const stagingDir = s`${tmpDir}/staging`;

describe('Roku Log Plugin', () => {
    let builder: ProgramBuilder;
    let plugin: RokuLogPlugin;
    let options: BsConfig;

    beforeEach(() => {
        plugin = new RokuLogPlugin();
        fsExtra.emptyDirSync(tmpDir);
        fsExtra.ensureDirSync(stagingDir);
        fsExtra.ensureDirSync(rootDir);

        builder = new ProgramBuilder();
        builder.plugins.add(plugin);

        options = util.normalizeAndResolveConfig({
            rootDir: rootDir,
            stagingDir: stagingDir,
            createPackage: false,
            retainStagingDir: true
        });
    });

    afterEach(() => {
        fsExtra.emptyDirSync(tmpDir);
        builder.dispose();
    });

    describe('basic tests', () => {
        it('strips logs', async () => {
            fsExtra.outputFileSync(`${rootDir}/source/test.spec.bs`, undent`
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

            await builder.run(options);

            expectFileEquals('test.spec.brs', undent`
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

        it('updates log lines', async () => {
            fsExtra.outputFileSync(s`${rootDir}/source/test.spec.bs`, `
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
            plugin.rokuLogConfig.strip = false;
            plugin.rokuLogConfig.insertPkgPath = true;
            await builder.run(options);
            expect(
                //linux tests end up with too many slashes, so remove one to make the test happy
                fsExtra.readFileSync(s`${stagingDir}/source/test.spec.brs`).toString().replace(/\/\/\/(.*)\/rootDir/gim, '')
            ).to.equal(undent`
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
                end function
            `.replace(/\/\/\/(.*)\/rootDir/gim, ''));
        });

        it('leaves comments', async () => {
            fsExtra.outputFileSync(`${rootDir}/source/test.spec.bs`, `
                'test comment here
                function f1()
                    'test comment here
                    m.log.info("i")
                    m.log.warn("w")
                    m.log.error("e")
                    m.log.verbose("v")
                    m.log.method("v")
                end function

                'test comment here
                namespace ns
                    function ns1()
                        'test comment here
                        m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                    'test comment here
                    class c1
                    'test comment here
                        function cm()
                            'test comment here
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
                        'test comment here
                        'test comment here
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                end class
            `);
            plugin.rokuLogConfig.strip = false;
            plugin.rokuLogConfig.insertPkgPath = false;
            plugin.rokuLogConfig.removeComments = false;
            await builder.run(options);

            expectFileEquals('test.spec.brs', undent`
                'test comment here
                function f1()
                    'test comment here
                    m.log.info("i")
                    m.log.warn("w")
                    m.log.error("e")
                    m.log.verbose("v")
                    m.log.method("v")
                end function
                'test comment here
                function ns_ns1()
                    'test comment here
                    m.log.info("i")
                    m.log.warn("w")
                    m.log.error("e")
                    m.log.verbose("v")
                    m.log.method("v")
                end function
                'test comment here
                function __ns_c1_builder()
                    instance = {}
                    instance.new = sub()
                    end sub
                    'test comment here
                    instance.cm = function()
                        'test comment here
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
                        'test comment here
                        'test comment here
                        m.log.verbose("v")
                        m.log.method("v")
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

        it('removes comments', async () => {
            fsExtra.outputFileSync(`${rootDir}/source/test.spec.bs`, `
                'test comment here
                function f1()
                    'test comment here
                    m.log.info("i")
                    m.log.warn("w")
                    m.log.error("e")
                    m.log.verbose("v")
                    m.log.method("v")
                end function

                'test comment here
                namespace ns
                    function ns1()
                        'test comment here
                        m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                    'test comment here
                    class c1
                    'test comment here
                    function cm()
                        'test comment here
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
                        'test comment here
                        'test comment here
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                end class
            `);
            plugin.rokuLogConfig.strip = false;
            plugin.rokuLogConfig.insertPkgPath = false;
            plugin.rokuLogConfig.removeComments = true;
            await builder.run(options);
            expectFileEquals('test.spec.brs', undent`
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
                end function
            `);
        });

        it('removes comments and strips', async () => {
            fsExtra.outputFileSync(`${rootDir}/source/test.spec.bs`, `
                'test comment here
                function f1()
                    'test comment here
                    m.log.info("i")
                    m.log.warn("w")
                    m.log.error("e")
                    m.log.verbose("v")
                    m.log.method("v")
                end function

                'test comment here
                namespace ns
                    function ns1()
                    'test comment here
                        m.log.info("i")
                        m.log.warn("w")
                        m.log.error("e")
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                    'test comment here
                    class c1
                        'test comment here
                        function cm()
                            'test comment here
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
                        'test comment here
                        'test comment here
                        m.log.verbose("v")
                        m.log.method("v")
                    end function
                end class
            `);
            plugin.rokuLogConfig.strip = true;
            plugin.rokuLogConfig.insertPkgPath = false;
            plugin.rokuLogConfig.removeComments = true;
            await builder.run(options);

            expectFileEquals('test.spec.brs', undent`
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
    });
});

function expectFileEquals(filename: string, expected: string) {
    expect(
        undent(
            fsExtra.readFileSync(s`${stagingDir}/source/${filename}`).toString()
        )
    ).to.eql(expected);
}
