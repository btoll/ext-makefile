'use strict';

let argv = require('yargs').argv,
    logger = require('logger'),
    fs = require('fs'),
    https = require('https'),
    path = require('path'),
    fiddle = argv.fiddle,
    filename = argv.file,
    error = logger.error,
    download;

function getFiddleDownloadUrl(fiddle) {
    // https://fiddle.sencha.com/#fiddle/u1u
    // https://fiddle.sencha.com/fiddle/u1u/preview
    return `https://fiddle.sencha.com/fiddle/${path.basename(fiddle)}/preview`;
}

download = exports.download = (fiddle, filename, iter) => {
    if (!fiddle) {
        error('You must provide a Fiddle!');
    } else {
        if (!filename) {
            filename = path.basename(fiddle);
        }

        https.get(getFiddleDownloadUrl(fiddle), (res) => {
            let dataStream = '';

            if (iter) {
                res.on('data', (data) => {
                    dataStream += data;
                });

                res.on('end', () => {
                    iter.next(dataStream);
                });
            } else {
                res.pipe(fs.createWriteStream(filename));
            }
        }).on('error', () => {
            error('Something went wrong!! Are you online? =)');
        });
    }
};

if (require.main === module) {
    if (!fiddle) {
        error('You must provide a Fiddle!');
    } else {
        download(fiddle, filename);
    }
}

