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

DIFF="$( which colordiff || echo diff )"

ALL_ERRORS=
for TEST_PATH in tests/*
do
    printf "%s " "${TEST_PATH}"

    ERROR=
    if ! ./index.js "${TEST_PATH}"/input.po | "${DIFF}" - "${TEST_PATH}"/output.csv
    then
        ERROR="${ERROR}- ./index.js ${TEST_PATH}/input.po\n"
        printf "${FAIL}"
    fi
    if !  ./index.js "${TEST_PATH}"/input.po "${TEST_PATH}"/input.csv | "${DIFF}" - "${TEST_PATH}"/output.po
    then
        ERROR="${ERROR}- ./index.js ${TEST_PATH}/input.po ${TEST_PATH}/input.csv\n"
        printf "${FAIL}"
    fi
    if [ -z "${ERROR}" ]
    then
        printf "${WIN}"
    else
        ALL_ERRORS="${ALL_ERRORS}${ERROR}"
    fi

    echo
done

if [ -n "${ALL_ERRORS}" ]
then
    FAILED_COUNT="$( printf -- "${ALL_ERRORS}" | wc -l )"
    printf "\nFailed %d tests:\n${ALL_ERRORS}" "${FAILED_COUNT}"
    exit 1
fi
