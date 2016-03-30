#!/bin/sh

set -e

./index.js tests/input.po | diff - tests/output.csv
./index.js tests/input.po tests/translated.csv | diff - tests/translated.po
