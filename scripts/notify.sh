#!/bin/bash

paplay ~/.notifications/notification.ogg &
zenity --info --text="$1" && wmctrl -x -a code