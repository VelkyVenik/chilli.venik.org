#!/bin/bash

cd $(dirname $(readlink -f $0))

. config.sh
. utils.sh

script_start $*

lock

UP=$(uptime -p)

while read line
do
    if [[ $line == "ERR"* ]]
    then
        warn $line
        continue
    fi

    if [[ "$line" != "START"*"END" ]]
    then
        continue
    fi

    debug "Arduino data: $line"

    for i in $line
    do
        name=$(echo $i | sed -e "s/=.*//")
        value=$(echo $i | sed -e "s/.*=//")

        case $name in
            soilTemp)
                SOILTEMP=$value
                ;;
            ardTemp)
                ARDTEMP=$value
                ;;
        esac
    done
    break
done < $ARDUINO_DEV

./wemo.sh remote_status
RETVAL=$?
if [ "$RETVAL" -ne 1 ]; then
    LIGHT="false"
else
    LIGHT="true"
fi

cpuTemp0=$(cat /sys/class/thermal/thermal_zone0/temp)
cpuTemp1=$(($cpuTemp0/1000))
cpuTemp2=$(($cpuTemp0/100))
cpuTempM=$(($cpuTemp2 % $cpuTemp1))
cpuFreq=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq)

SYSTEMP0="$cpuTemp1"."$cpuTempM"
SYSTEMP1=$(/opt/vc/bin/vcgencmd measure_temp | sed -e"s/temp=\(.*\).C/\1/")
SYSFREQ=$(($cpuFreq/1000))

debug "temp0=$SOILTEMP sysUpTime=$UP lightState=$LIGHT sysTemp0=$SYSTEMP0 sysTemp1=$SYSTEMP1 sysFreq0=$SYSFREQ sysTemp2=$ARDTEMP"


curl -i -X POST -d "auth=$API_SECRET" \
    -d "temp0=$SOILTEMP" \
    -d "sysUpTime=$UP" \
    -d "lightState=$LIGHT" \
    -d "sysTemp0=$SYSTEMP0" \
    -d "sysTemp1=$SYSTEMP1" \
    -d "sysFreq0=$SYSFREQ" \
    -d "sysTemp2=$ARDTEMP" \
    $API_URL/add >/dev/null 2>&1

script_end
