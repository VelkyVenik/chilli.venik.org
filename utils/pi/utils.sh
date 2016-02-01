#!/bin/bash

function script_start()
{
    debug "Start: $0, params($#) $*"
}

function script_end()
{
    debug "End: $0"
}

function debug()
{
    if [ "$DEBUG" -eq "1" ]; then
        echo $1
        echo $(date) $1 >> ${LOGDIR}/debug.log
    fi
}

function warn()
{
    if [ "$DEBUG" -eq "1" ]; then
        echo $1
    fi

    echo $(date) $1 >> ${LOGDIR}/debug.log
    echo $(date) $1 >> ${LOGDIR}/warn.log
}

function lock()
{
    debug "Acquiring lock"
    LCK="/tmp/$(basename "$0").lock"
    exec 8>$LCK

    if ! flock -n -x 8
    then
        warn "Already running"
        script_end
        exit
    fi
}
