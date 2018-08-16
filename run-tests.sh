#!/bin/sh
# shellcheck disable=SC2059
set -e

if locale | grep LC_CTYPE | grep -Eqi 'utf.?8'
then
    FAIL=✗
    WIN=✓
else
    FAIL=error
    WIN=passed
fi

if [ -t 1 ]
then
    FAIL="\033[31m${FAIL}\033[m"
    WIN="\033[32m${WIN}\033[m"
fi

ALL_ERRORS=
for TEST_PATH in tests/*
do
    printf "%s " "${TEST_PATH}"

    ERROR=
    if ! ./index.js "${TEST_PATH}"/input.po | diff - "${TEST_PATH}"/output.csv
    then
        ERROR=1
        printf "${FAIL}"
    fi
    if !  ./index.js "${TEST_PATH}"/input.po "${TEST_PATH}"/input.csv | diff - "${TEST_PATH}"/output.po
    then
        ERROR=1
        printf "${FAIL}"
    fi
    if [ -z "${ERROR}" ]
    then
        printf "${WIN}"
    fi

    echo

    ALL_ERRORS="${ALL_ERRORS}${ERROR}"
done

if [ -n "${ALL_ERRORS}" ]
then
    exit 1
fi
