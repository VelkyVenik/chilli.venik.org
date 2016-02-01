#!/bin/bash

DEBUG=0

DIR=/opt/chilli

BINDIR=${DIR}/bin
DATADIR=${DIR}/data
SHOTSDIR=${DIR}/camera
LOGDIR=${DIR}/log

# Wemo configuration
WEMO_NAME=chilli

# Camera configuration
CAMERA_CHECK_WEMO=1
CAMERA_SHOT_WEB=0
CAMERA_SHOT_PI=1
CAMERA_SHOT_URL="http://192.168.88.7:8080/?action=snapshot"
CAMERA_STREAM_URL=""

# API Configuration
API_SECRET=""
API_URL=""

# Arduiono
ARDUINO_DEV="/dev/ttyACM0"


if [ -e "config-local.sh" ]; then
	. config-local.sh
fi

