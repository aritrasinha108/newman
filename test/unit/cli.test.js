describe.skip('cli parser', function () {
    var cli;
    // var cli = require('../../bin/newman');

    it('should export a function', function () {
        expect(cli).to.be.a('function');
    });

    it('should display the current Newman version', function (done) {
        cli(['--version'], 'newmantests', function (err) {
            expect(err).to.be.null;
            done();
        });
    });

    describe('Run Command', function () {
        it('should handle standard run command (run collection.json and -e)', function (done) {
            cli('run myCollection.json --environment env.json -n 2'.split(' '), 'newmantests',
                function (err, config) {
                    expect(err).to.be.null;
                    expect(config.command).to.equal('run');
                    expect(config.run).to.be.ok;
                    expect(config.run.iterationCount, 'should have iterationCount of 2').to.equal(2);
                    expect(config.run.collection).to.equal('myCollection.json');
                    expect(config.run.environment).to.equal('env.json');

                    done();
                });
        });

        it('should throw an error for invalid --iteration-count values', function (done) {
            cli('run myCollection.json -n -3.14'.split(' '), 'newmantests', function (err) {
                expect(err.message).to.equal('The value must be a positive integer.');

                done();
            });
        });

        describe('--global-var', function () {
            // test for 'should throw an error for missing --global-var values' has been moved to
            // cli/run-options.test.js since commander throws custom error in case of argument
            //  mismatch and that is better handled through exec and stderr check.
            it('should handle --global-var values without an `=`', function (done) {
                cli('run myCollection.json --global-var foo'.split(' '), 'newmantests', function (err, res) {
                    expect(err).to.be.null;
                    expect(res.run.globalVar).to.eql([
                        { key: 'foo', value: undefined }
                    ]);

                    done();
                });
            });
        });

        it('should load all arguments (except reporters)', function (done) {
            cli(('run ' +
            'myCollection.json ' +
            '-e myEnv.json ' +
            '-g myGlobals.json ' +
            '-d path/to/csv.csv ' +
            '--folder myFolder ' +
            '--export-environment exported_env.json ' +
            '--export-globals exported_glob.json ' +
            '--reporter-cli-no-summary ' +
            '--iteration-count 23 ' +
            '--reporters json ' +
            '--global-var foo=bar --global-var alpha==beta= ' +
            '--no-color ' +
            '--delay-request 12000 ' +
            '--timeout 10000 ' +
            '--timeout-request 5000 ' +
            '--timeout-script 5000 ' +
            '--ignore-redirects ' +
            '--bail ' +
            '--suppress-exit-code ' +
            '-k').split(' '), 'newmantests', function (err, config) {
                expect(err).to.be.null;

                var opts = config.run;

                expect(opts).to.be.ok;
                expect(opts.collection).to.equal('myCollection.json');
                expect(opts.environment).to.equal('myEnv.json');
                expect(opts.folder).to.equal('myFolder');
                expect(opts.exportEnvironment).to.equal('exported_env.json');
                expect(opts.iterationData).to.equal('path/to/csv.csv');
                expect(opts.globals).to.equal('myGlobals.json');
                expect(opts.exportGlobals).to.equal('exported_glob.json');
                expect(opts.delayRequest, 'should have delayRequest of 12000').to.equal(12000);
                expect(opts.timeout, 'should have timeout of 10000').to.equal(10000);
                expect(opts.timeoutRequest, 'should have timeoutRequest of 5000').to.equal(5000);
                expect(opts.timeoutScript, 'should have timeoutScript of 5000').to.equal(5000);
                expect(opts.ignoreRedirects, 'should have ignoreRedirects to be true').to.equal(true);
                expect(opts.insecure, 'shoudl have insecure to be true').to.equal(true);

                expect(opts.color, 'should have color to be false').to.equal(false);

                expect(opts.reporters).to.contain('json');
                expect(opts.reporters).to.not.contain('junit');

                expect(opts.globalVar).to.eql([
                    { key: 'foo', value: 'bar' },
                    { key: 'alpha', value: '=beta=' }
                ]);

                expect(opts.bail, 'should have bail to be true').to.equal(true);
                expect(opts.suppressExitCode, 'should have suppressExitCode to be true').to.equal(true);

                done();
            });
        });

        it('should load all arguments (including reporters)', function (done) {
            cli(('run ' +
            'myCollection.json ' +
            '-e myEnv.json ' +
            '-g myGlobals.json ' +
            '-d /path/to/csv.csv ' +
            '--folder myFolder ' +
            '--disable-unicode ' +
            '--export-environment exported_env.json ' +
            '--export-globals exported_glob.json ' +
            '--reporter-cli-no-summary ' +
            '--reporter-cli-no-success-assertions ' +
            '--iteration-count 23 ' +
            '--reporters json ' +
            '--no-color ' +
            '--delay-request 12000 ' +
            '--timeout 10000 ' +
            '--timeout-request 5000 ' +
            '--timeout-script 5000 ' +
            '--ignore-redirects ' +
            '-k ' +
            '--bail folder,failure ' +
            '--global-var foo=bar --global-var alpha==beta= ' +
            '--reporter-json-output ./omg.txt ' +
            '--reporter-use everything').split(' '), 'newmantests', function (err, config) {
                expect(err).to.be.null;

                var opts = config.run;

                expect(opts).to.be.ok;
                expect(opts.collection).to.equal('myCollection.json');
                expect(opts.environment).to.equal('myEnv.json');
                expect(opts.folder).to.equal('myFolder');
                expect(opts.disableUnicode, 'should have disableUnicode to be true').to.equal(true);

                expect(opts.exportEnvironment).to.equal('exported_env.json');
                expect(opts.iterationData).to.equal('/path/to/csv.csv');
                expect(opts.globals).to.equal('myGlobals.json');

                expect(opts.exportGlobals).to.equal('exported_glob.json');
                expect(opts.delayRequest, 'should have delayRequest of 12000').to.equal(12000);
                expect(opts.timeout, 'should have timeout of 10000').to.equal(10000);
                expect(opts.timeoutRequest, 'should have timeoutRequest of 5000').to.equal(5000);
                expect(opts.timeoutScript, 'should have timeoutScript of 5000').to.equal(5000);
                expect(opts.ignoreRedirects, 'should have ignoreRedirects to be true').to.equal(true);
                expect(opts.insecure, 'should have insecure to be true').to.equal(true);

                expect(opts.globalVar).to.eql([
                    { key: 'foo', value: 'bar' },
                    { key: 'alpha', value: '=beta=' }
                ]);
                expect(opts.bail).to.eql([
                    'folder',
                    'failure'
                ]);

                expect(opts.color, 'should have color to be false').to.equal(false);

                expect(opts.reporters).to.contain('json');
                expect(opts.reporters).to.not.contain('verbose');
                expect(opts.reporters).to.not.contain('junit');

                // Generic reporter options
                expect(opts.reporterOptions).to.be.ok;
                expect(opts.reporterOptions.use).to.equal('everything');
                expect(opts.reporterOptions.cliNoSuccessAssertions
                    , 'should have cliNoSuccessAssertions to be true').to.equal(true);

                // Individual reporter options
                expect(opts.reporter).to.be.ok;

                // Validate JSON reporter configuration
                expect(opts.reporter.json).to.be.ok;
                expect(opts.reporter.json.output).to.equal('./omg.txt');
                expect(opts.reporter.json.use).to.equal('everything');

                done();
            });
        });

        it('should turn off newman banner if --reporter-cli-no-banner is set', function (done) {
            cli('run myCollection.json --reporter-cli-no-banner'.split(' '), 'newmantests', function (err, res) {
                expect(err).to.be.null;
                expect(res.command).to.equal('run');
                expect(res.run).to.be.ok;
                expect(res.run.reporter.cli.noBanner, 'should have noBanner to be true').to.equal(true);

                done();
            });
        });
    });
});
