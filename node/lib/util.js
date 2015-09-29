var fs = require('fs'),
    inquirer = require('inquirer'),
    osenv = require('osenv'),
    getConfigFile, locateConfigFile, showConfigFile,writeFile;

getConfigFile = exports.getConfigFile = function (callback, transform) {
    var config = locateConfigFile(callback);

    fs.readFile(config, {
        encoding: 'utf8'
    }, function (err, data) {
        if (err) {
            callback(e);
        }

        if (transform !== false) {
            data = JSON.parse(data);
        }

        callback(null, data, config);
    });
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
        message: 'Add root location of web server:',
        default: '/usr/local/www/'
    }, {
        type: 'input',
        name: 'ext6',
        message: 'Add location of Ext 6 repo:',
        default: '/usr/local/www/SDK6/'
    }, {
        type: 'input',
        name: 'ext5',
        message: 'Add location of Ext 5 repo:',
        default: '/usr/local/www/SDK5/'
    }, {
        type: 'input',
        name: 'ext4',
        message: 'Add location of Ext 4 repo:',
        default: '/usr/local/www/SDK4/'
    }, {
        type: 'input',
        name: 'bugs',
        message: 'Add location of bug directory:',
        default: '/usr/local/www/extjs/bugs/'
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

locateConfigFile = function (callback) {
    var e = {
            name: '\n.extmakefilerc does not exist!\n',
            message: 'The current operation expects that the config file has already been created, do `extmakefile --init`.\n'
        },
        config = '.extmakefilerc';

    // Here we're just checking for the existence of a config file (check locally first).
    try {
        fs.statSync(config);
    } catch (foo) {
        try {
            config = osenv.home() + '/' + config;
            fs.statSync(config);
        } catch (err) {
            return callback(e);
        }
    }

    return config;
};

showConfigFile = exports.showConfigFile = function (callback) {
    getConfigFile(function (err, json, config) {
        if (err) {
            console.log(err.name);
            console.log(err.message);
            return;
        }

        console.log(json);

        if (callback) {
            callback(err, json, config);
        }
    }, /*transform*/ false);
};

writeFile = exports.writeFile = function (filename, data, callback) {
    // Note we always want to write to the config file, but any notefiles
    // should always be appended to.
    var flag = filename.indexOf('.extmakefilerc') > -1 ? 'w' : 'a';

    fs.writeFile(filename, data, {
        encoding: 'utf8',
        flag: flag,
        // Octal 0666.
        mode: 438
    }, function (err) {
        if (err) {
            return callback(err);
        }

        callback(null);
    });
};

