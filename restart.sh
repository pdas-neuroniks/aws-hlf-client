#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

set -x

kill -9 $(lsof -i:3000 -t) 2> /dev/null

sleep 2

node bin/www > ms_log.log 2> ms_log_err.log &

sleep 2

tail -F ms_log.log
