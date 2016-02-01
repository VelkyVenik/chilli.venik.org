#!/bin/bash

cd $(dirname $(readlink -f $0))

. config.sh
. utils.sh

script_start $*

lock

FILE=$(date +%Y%m%d%H%M).jpg
D=$(date +"%Y-%m-%d %R")

if [ "$CAMERA_CHECK_WEMO" -eq 1 ]; then
    ./wemo.sh remote_status
    RETVAL=$?
    if [ "$RETVAL" -ne 1 ]; then
        debug "Light is off, no camera pictures..."
        script_end
        exit -1
    fi
fi

if [ "$CAMERA_SHOT_WEB" -eq 1 ]; then
    debug "Taking camera picture from web: $FILE"
    wget $CAMERA_SHOT_URL -O - -a ${LOGDIR}/camera-shot.log | \
        convert - -transpose -transpose -rotate 180 - | \
        convert - -pointsize 24 -fill red -draw "text 5,520 '$D'" ${SHOTSDIR}/${FILE}
fi

if [ "$CAMERA_SHOT_PI" -eq 1 ]; then
    debug "Taking camera picture by raspistill: $FILE"
    /opt/vc/bin/raspistill -n -rot 90 -t 1 -q 75 -o - | \
        convert - -pointsize 32 -fill red -draw "text 10,1900 '$D'" ${SHOTSDIR}/${FILE}
fi

debug "Copying file to remote location"
convert ${SHOTSDIR}/${FILE} -resize 30% - | curl -i -X POST $API_URL/currentPhoto -F auth=$API_SECRET -F photo=@- >/dev/null 2>&1


script_end

