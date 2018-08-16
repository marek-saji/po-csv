PO↔CSV
======

[![Build Status](https://travis-ci.org/marek-saji/po-csv.svg)](https://travis-ci.org/marek-saji/po-csv)
[![Code Climate](https://codeclimate.com/github/marek-saji/po-csv/badges/gpa.svg)](https://codeclimate.com/github/marek-saji/po-csv)
[![Dependencies Status](https://david-dm.org/marek-saji/po-csv/status.svg)](https://david-dm.org/marek-saji/po-csv)


Convert GNU gettext PO files from CSV files and merge them back in.

Not many translation agencies are willing to use [POEdit] and require to
send them text to translate as spreadsheet files. This tool extracts
data form PO files and stores them in CSV files, which can be opened in
Excels, Google Spreadsheets, Calcs, Numbers and whatnot.

> But isn't there already [csv2po], which does _exactly_ that?

Unfortunately not “exactly”. It seems not to support:

- plural forms,
- notes to translators.


Usage
-----

    node index.js file.po > untranslated.csv

Then send `untranslated.csv` for translation and ask to change **only**
columns starting with “msgstr”. When you get your CSV beautifully
translated do:

    node index.js file.po translated.csv > translated.po
    cp translated.po file.po


______
[POEdit]: http://poedit.net/
[csv2po]: http://translate-toolkit.readthedocs.org/en/latest/commands/csv2po.html
