#!/bin/bash

cd $(dirname $(readlink -f $0))

. config.sh
. utils.sh

script_start $*

lock

PINS="24 25" 
RETVAL=0

for PIN in $PINS
do
    if [ ! -d "/sys/class/gpio/gpio${PIN}/" ]; then
        debug "Initializing $PIN - /sys/class/gpio/gpio${PIN}/"
        echo "$PIN" > /sys/class/gpio/export
        echo "out" > /sys/class/gpio/gpio${PIN}/direction
    fi

    if [ "$#" -ne 1 ]; then
        RETVAL=$(cat /sys/class/gpio/gpio${PIN}/value)
        debug  "Light $PIN: $RETVAL"
    else
        debug "Set heating $PIN to $1"
        echo $1 > /sys/class/gpio/gpio${PIN}/value
    fi
done

script_end

exit $RETVAL
