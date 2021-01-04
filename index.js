#!/usr/bin/env node

require('array.prototype.fill');

var PO = require('pofile');
var csvParse = require('@fast-csv/parse').parseString
var csvFormat = require('@fast-csv/format').writeToString
var fs = require('fs');

if (! global.Promise)
{
    global.Promise = require('promise');
}

function throwUp (e)
{
    console.error(e.stack);
}

function splitIntoLines (string)
{
    return string.trim().split('\n').filter(function (line) {
        return line !== '';
    });
}

function loadPoFile (poFilePath)
{
    return new Promise(function (resolve) {
        PO.load(poFilePath, function (error, poData) {
            if (error)
            {
                throw error;
            }
            if (poData.headers['Plural-Forms'])
            {
                poData.nplurals = (
                        ( poData.headers['Plural-Forms'] || '' )
                        .match(/nplurals\s*=\s*([0-9])/) || [,1]
                    )[1];
            }
            else
            {
                poData.nplurals = Math.max.apply(undefined,
                    poData.items.map(function (item) {
                        return item.msgstr.length;
                    })
                );
            }
            resolve(poData);
        });
    });
}

function loadCsvFile (csvFilePath)
{
    return (new Promise(function (resolve, reject) {
        fs.readFile(csvFilePath, function (error, csvDataString) {
            if (error) {
                reject(error);
            } else {
                resolve(csvDataString);
            }
        });
    })).then(loadCsvDataString);
}

function loadCsvDataString (csvDataString)
{
    var csvData = [];
    return new Promise(function (resolve, reject) {
        csvParse(
            csvDataString,
            {
                headers: true
            }
        )
            .on('data', function (row) {
                csvData.push(row);
            })
            .on('error', reject)
            .on('end', function () {
                resolve(csvData);
            });
    });
}


function transformPoToCsv (poData)
{
    return csvFormat(
        poData.items,
        {
            headers: true,
            transform: transformPoItemToCsvRow.bind(null, poData.nplurals)
        }
    );
}

function transformCsvToPo (csvData)
{
    return Promise.resolve(csvData.map(transformCsvRowToPoItem));
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
                .concat(new Array(nplurals - item.msgstr.length).fill(''))
                .map(function (str, idx) {
                    return ['msgstr[' + idx + ']', str];
                })
            );
    return row;
}

function transformCsvRowToPoItem (row)
{
    var i;
    var item = new PO.Item();
    var plural = false;

    item.msgid             = row.msgid             || item.msgid;
    item.msgid_plural      = row.msgid_plural      || item.msgid_plural;
    item.references        = splitIntoLines(row.references)        || item.references;
    item.extractedComments = splitIntoLines(row.extractedComments) || item.extractedComments;
    splitIntoLines(row.flags).forEach(function (flag) {
        item.flags[flag] = true;
    });

    for (i = 0 ; 'msgstr[' + i + ']' in row ; i += 1)
    {
        item.msgstr[i] = row['msgstr[' + i + ']'];
        if (i && item.msgstr[i])
        {
            plural = true;
        }
    }
    if (! plural)
    {
        item.msgstr = [ item.msgstr[0] ];
    }

    return item;
}

function writeCsvOutput (data)
{
    process.stdout.write(data + '\n');
}


function mergeIntoPo (datas)
{
    var target = datas.shift();
    var targetItemsByMsgId = {};
    target.items.forEach(function (item) {
        targetItemsByMsgId[item.msgid] = item;
    });

    datas.forEach(function (itemsToMerge) {
        itemsToMerge.forEach(function (item) {
            var targetItem = targetItemsByMsgId[item.msgid];
            if (! targetItem)
            {
                throw Error('Item "' + item.msgid + '" does not exist in target PO file.');
            }
            if (targetItem.msgid_plural !== item.msgid_plural)
            {
                throw Error('msgid_plural mismatch for "' + item.msgid + '"');
            }
            targetItem.msgstr = item.msgstr;
            targetItem.flags  = item.flags;
        });
    });

    return Promise.resolve(target);
}

function writePoOutput (poData)
{
    try
    {
        process.stdout.write('' + poData + '\n');
    }
    catch (e) { throw e; }
}

function printHelp ()
{
    process.stdout.write('' + fs.readFileSync(__dirname + '/README.md') + '\n');
}

function printPoAsCsv (poFilePath)
{
    loadPoFile(poFilePath)
        .then(transformPoToCsv)
        .then(writeCsvOutput)
        .catch(throwUp);
}

function mergeCsvIn (poFilePath, csvFilePath)
{
    Promise.all([
        loadPoFile(poFilePath),
        loadCsvFile(csvFilePath)
            .then(transformCsvToPo)
    ])
        .then(mergeIntoPo)
        .then(writePoOutput)
        .catch(throwUp);
}

if (3 === process.argv.length)
{
    printPoAsCsv(process.argv[2]);
}
else if (4 === process.argv.length)
{
    mergeCsvIn(process.argv[2], process.argv[3]);
}
else
{
    printHelp();
}
