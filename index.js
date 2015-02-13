#!/usr/bin/env node

var PO = require('pofile');
var csv = require('fast-csv');
var fs = require('fs');

if (! global.Promise)
{
    global.Promise = require('promise');
}

function throwUp (e)
{
    console.error(e.stack);
}

function not (fn)
{
    return function () {
        return ! fn.apply(this, arguments);
    };
}

function loadPoFile (poFilePath)
{
    return new Promise(function (resolve, reject) {
        PO.load(poFilePath, function (error, poData) {
            if (error)
            {
                throw error;
            }
            poData.nplurals = (
                    ( poData.headers['Plural-Forms'] || '' )
                    .match(/nplurals\s*=\s*([0-9])/) || [,1]
                )[1];
            resolve(poData);
        });
    });
}

function transformPoToCsv (poData)
{
    return new Promise(function (resolve, reject) {
        csv.writeToString(
            poData.items,
            {
                headers: true,
                transform: transformPoItemToCsvRow.bind(null, poData.nplurals)
            },
            function (err, data) {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve(data);
                }
            }
        );
    });
}

function transformPoItemToCsvRow (nplurals, item)
{
    var row;

    row = [
        [ 'msgid',             item.msgid ],
        [ 'msgid_plural',      item.msgid_plural ],
        [ 'flags',             Object.keys(item.flags).join(', ') ],
        [ 'references',        item.references ],
        [ 'extractedComments', item.extractedComments.join('\n') ],
        [ 'comments',          item.comments.join('\n') ]
            ].concat(
                // Rest of the columns are msgstr[idx]
                item.msgstr
                // Fill up with '' to nplurals length
                .concat(new Array (nplurals - item.msgstr.length).join('.').split('.'))
                .map(function (str, idx) {
                    return ['msgstr[' + idx + ']', str];
                })
            );
    return row;
}

function writeCsvOutput (data)
{
    console.log(data);
}

function printHelp ()
{
    console.log('' + fs.readFileSync(__dirname + '/README.md'));
}

function printPoAsCsv (poFilePath)
{
    loadPoFile(poFilePath)
        .then(transformPoToCsv)
        .then(writeCsvOutput)
        .catch(throwUp);
}


if (3 === process.argv.length)
{
    printPoAsCsv(process.argv[2]);
}
else
{
    printHelp();
}
