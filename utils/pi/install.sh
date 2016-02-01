#!/bin/bash

. config.sh


# create directories
mkdir -p $DIR
mkdir -p $BINDIR
mkdir -p $DATADIR
mkdir -p $SHOTSDIR
mkdir -p $LOGDIR

# copy files
cp *.sh $BINDIR

# fix permissions
chmod +x ${BINDIR}/*.sh
