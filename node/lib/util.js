var fs = require('fs'),
    inquirer = require('inquirer'),
    writeFile;

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
        name: 'notefiles',
        message: 'Add a default notefile.',
        default: 'foo.txt'
    }, {
        type: 'input',
        name: 'noteservers',
        message: 'Add a default noteserver.',
        default: 'filesystem'
    }, {
        type: 'list',
        name: 'encryption',
        message: 'Use encryption?',
        default: true,
        choices: [
            {name: 'Yes', value: true},
            {name: 'No', value: false}
        ]
    }, {
        type: 'list',
        name: 'cipher',
        message: 'Default cipher:',
        default: 'blowfish',
        choices: [
            {name: 'AES-256', value: 'aes256'},
            {name: 'Blowfish', value: 'blowfish'},
            {name: 'Triple DES', value: 'des3'},
            {name: 'None', value: false}
        ],
        when: function (answers) {
            return answers.encryption;
        }
    }, {
        type: 'list',
        name: 'system',
        message: 'What line endings do you use?',
        default: 'unix',
        choices: [
            {name: 'Unix', value: 'unix'},
            {name: 'Windows', value: 'windows'}
        ]
    }, {
        type: 'list',
        name: 'newlines',
        message: 'How many newlines in between notes?',
        default: 1,
        choices: [
            {name: 'Zero', value: 0},
            {name: 'One', value: 1},
            {name: 'Two', value: 2}
        ]
    }], function (answers) {
        var config = '.notefilerc',
            notefile = answers.notefiles,
            noteserver = answers.noteservers;

        // Even though we only asked for a default notefile/server, we want the json to reflect an array
        // as more values will/could be added to each.
        answers.notefiles = [notefile];
        answers.noteservers = [noteserver];

        answers.defaults = {
            notefile: notefile,
            noteserver: noteserver
        };

        if (answers.encryption) {
            answers.defaults.cipher = answers.cipher;
            delete answers.cipher;
        }

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

writeFile = exports.writeFile = function (filename, data, callback) {
    // Note we always want to write to the config file, but any notefiles
    // should always be appended to.
    var flag = filename.indexOf('.extmakefile') > -1 ? 'w' : 'a';

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

