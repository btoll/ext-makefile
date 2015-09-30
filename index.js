var argv = require('yargs').argv,
    inquirer = require('inquirer'),
    util = require('lib/util'),
    fiddle = argv.fiddle,
    filename = argv.file,
    init = argv.init;

if (require.main === module) {
    if (init) {
        util.init();
    } else {
        if (!filename) {
            inquirer.prompt([{
                type: 'input',
                name: 'filename',
                message: 'Name of new file:',
                default: 'foo.html'
            }], function (answers) {
                util.startGenerator(fiddle, answers.filename);
            });
        } else {
            util.startGenerator(fiddle, filename);
        }
    }
}

