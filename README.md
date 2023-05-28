PO↔CSV
======

[![CI](https://github.com/marek-saji/po-csv/actions/workflows/ci.yml/badge.svg)](https://github.com/marek-saji/po-csv/actions/workflows/ci.yml)
[![Code Climate](https://codeclimate.com/github/marek-saji/po-csv/badges/gpa.svg)](https://codeclimate.com/github/marek-saji/po-csv)


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

    npx po-csv file.po > untranslated.csv

Then send `untranslated.csv` for translation and ask to change **only**
columns starting with “msgstr”. When you get your CSV beautifully
translated do:

    npx po-csv file.po translated.csv > translated.po
    mv translated.po file.po


______
[POEdit]: http://poedit.net/
[csv2po]: http://translate-toolkit.readthedocs.org/en/latest/commands/csv2po.html
