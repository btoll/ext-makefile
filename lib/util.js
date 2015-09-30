// TODO: What should be exported?
// TODO: Improve logging.

var fs = require('fs'),
    getFiddle = require('./getFiddle'),
    inquirer = require('inquirer'),
    osenv = require('osenv'),
    reExtract = /(?:\n|.)*(window\.onload(?:\n|.)*?)<\/script>(?:\n|.)*/,
    reToken = /(?:{(.+?)})/g,
    gen, extractScript, getConfigFile, getCssResource, locateConfigFile, makeFile,
    getTemplate, makeTemplate, showConfigFile, writeFile, themes;

function maybeAddTrailingSlash(v) {
    if (v.charAt(v.length - 1) !== '/') {
        v += '/';
    }

    return v;
}

themes = exports.themes = [
    {name: 'Classic', value: 'classic'},
    {name: 'Crisp', value: 'crisp'},
    {name: 'Gray', value: 'gray'},
    {name: 'Neptune', value: 'neptune'}
];

getCssResource = exports.getCssResource = (function () {
    var cssMap = {
        ext4: 'resources/css/ext-all.css',
        ext5: 'packages/ext-theme-{theme}/build/resources/ext-theme-{theme}-all.css',
        ext6: 'build/classic/theme-{theme}/resources/theme-{theme}-all-debug.css'
    };

    return function (version, theme) {
        return cssMap[version].replace(reToken, function () {
            return theme;
        });
    };
}());

getConfigFile = exports.getConfigFile = function (callback, transform) {
    try {
        var config = locateConfigFile();

        fs.readFile(config, {
            encoding: 'utf8'
        }, function (err, data) {
            if (err) {
                callback(err);
            }

            if (transform !== false) {
                data = JSON.parse(data);
            }

            callback(null, data, config);
        });
    } catch (e) {
        console.log(e.name, e.message);
    }
};

getTemplate = (function () {
    var srcDirMap = {
        ext4: 'extjs/',
        ext5: 'ext/',
        ext6: 'ext/'
    };

    return function (script) {
        getConfigFile(function (err, json) {
            if (err) {
                console.log(err.name, err.message);
            } else {
                inquirer.prompt([{
                    type: 'list',
                    name: 'version',
                    message: 'Select version:',
                    default: 'ext6',
                    choices: [
                        {name: 'ExtJS 4', value: 'ext4'},
                        {name: 'ExtJS 5', value: 'ext5'},
                        {name: 'ExtJS 6', value: 'ext6'}
                    ]
                }, {
                    type: 'list',
                    name: 'theme',
                    message: 'Select theme:',
                    default: json.theme,
                    choices: themes
                }], function (answers) {
                    var version = answers.version,
                        path = json.webserver + json[version] + srcDirMap[version];

                    gen.next(makeTemplate({
                        css: path + getCssResource(version, answers.theme),
                        js: path + 'ext.js',
                        script: script
                    }));
                });
            }
        });
    };
}());

extractScript = exports.extractScript = function (html) {
    setTimeout(function () {
        gen.next(html.replace(reExtract, function (a, $1) {
            return $1;
        }));
    }, 0);
};

exports.init = function () {
    inquirer.prompt([{
        type: 'list',
        name: 'global',
        message: 'Create a global config file.',
        default: true,
        choices: [
            {name: 'Yes', value: true},
            {name: 'No', value: false}
        ]
    }, {
        type: 'input',
        name: 'webserver',
        message: 'Add address of web server:',
        default: 'http://localhost/',
        filter: maybeAddTrailingSlash
    }, {
        type: 'input',
        name: 'ext4',
        message: 'Add location of Ext 4 repo (relative to web server):',
        default: 'SDK4/',
        filter: maybeAddTrailingSlash
    }, {
        type: 'input',
        name: 'ext5',
        message: 'Add location of Ext 5 repo (relative to web server):',
        default: 'SDK5/',
        filter: maybeAddTrailingSlash
    }, {
        type: 'input',
        name: 'ext6',
        message: 'Add location of Ext 6 repo (relative to web server):',
        default: 'SDK6/',
        filter: maybeAddTrailingSlash
    }, {
        type: 'list',
        name: 'theme',
        message: 'Choose the default theme:',
        default: 'classic',
        choices: themes
    }], function (answers) {
        var config = '.extmakefilerc';

        if (answers.global) {
            config = osenv.home() + '/' + config;
        }

        delete answers.global;

        writeFile(config, JSON.stringify(answers, null, 4), function (err) {
            if (err) {
                throw err;
            }

            showConfigFile(function (err) {
                if (!err) {
                    console.log('\nCreated ' + config + ' config file!\n');
                }
            });

        });
    });
};

locateConfigFile = function () {
    var config = '.extmakefilerc';

    // Here we're just checking for the existence of a config file (check locally first).
    try {
        fs.statSync(config);
    } catch (foo) {
        try {
            config = osenv.home() + '/' + config;
            fs.statSync(config);
        } catch (err) {
            throw({
                name: '\n.extmakefilerc does not exist!\n',
                message: 'The current operation expects that the config file has already been created, do `ext-makefile --init`.\n'
            });
        }
    }

    return config;
};

makeFile = exports.makeFile = function* (fiddle, filename) {
    var script = '';

    if (fiddle) {
        script = yield getFiddle.download(fiddle, filename, gen);
        script = yield extractScript(script);
    }

    script = yield getTemplate(script);
    yield writeFile(filename, script, function (err) {
        if (err) {
            console.log('Error: Could not create file ' + filename);
        } else {
            console.log('Created file ' + filename);
        }
    });
};

makeTemplate = exports.makeTemplate = function (sources) {
    // https://esdiscuss.org/topic/multiline-template-strings-that-don-t-break-indentation
    // https://stackoverflow.com/questions/25924057/multiline-strings-that-dont-break-indentation
    // TODO: Clean this up.
    return `<!DOCTYPE html>
<html>
<head>
<title>FIX ME</title>
<link rel="stylesheet" type="text/css" href="${sources.css}" />
<script type="text/javascript" src="${sources.js}"></script>
<script type="text/javascript">
${sources.script}
</script>
</head>

<body>
</body>
</html>

`;
};

showConfigFile = exports.showConfigFile = function (callback) {
    getConfigFile(function (err, json, config) {
        if (err) {
            console.log(err.name, err.message);
        } else {
            console.log(json);

            if (callback) {
                callback(err, json, config);
            }
        }
    }, /*transform*/ false);
};

exports.startGenerator = function (fiddle, filename) {
    gen = makeFile(fiddle, filename);
    gen.next();
};

writeFile = exports.writeFile = function (filename, data, callback) {
    fs.writeFile(filename, data, {
        encoding: 'utf8',
        flag: 'w',
        // Octal 0666.
        mode: 438
    }, function (err) {
        if (err) {
            return callback(err);
        }

        callback(null);
    });
};

