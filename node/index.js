var argv = require('yargs').argv,
    fs = require('fs'),
    getFiddle = require('getFiddle'),
    path = require('path'),
    fiddle = argv.fiddle,
    filename = argv.file,
    reExtract, extractScript, makeFile, writeFile, gen;

reExtract = exports.reExtract =  /(?:\n|.)*(window\.onload(?:\n|.)*?)<\/script>(?:\n|.)*/,

extractScript = exports.extractExtract = function (html) {
    setTimeout(function () {
        gen.next(html.replace(reExtract, function (a, $1) {
            return $1;
        }));
    }, 0);
};

makeFile = exports.makeFile = function* (fiddle, filename) {
    var str = yield getFiddle.download(fiddle, filename, gen);
    str = yield extractScript(str);
    yield writeFile(filename, str);
};

writeFile = exports.writeFile = function (filename, str, callback) {
    fs.writeFile(filename, str, function (err) {
        if (err) {
            err.message = 'Error: Something bad happened!';

            if (callback) {
                callback(err);
            }
        }

        if (callback) {
            callback(null);
        }
    });
};

    //HTML="<html>\n<head>\n<title>$TITLE</title>\n<link rel=\"stylesheet\" type=\"text/css\" href=\"$CSS_HREF\" />\n<script type=\"text/javascript\" src=\"$JS_SRC\"></script>\n<script type=\"text/javascript\">\n</script>\n</head>\n\n<body>\n</body>\n</html>\n"

if (require.main === module) {
    if (!fiddle) {
        console.log('Error: You must provide a Fiddle!');
    } else {
        if (!filename) {
            filename = path.basename(fiddle);
        }

        gen = makeFile(fiddle, filename);
        gen.next();
    }
}

