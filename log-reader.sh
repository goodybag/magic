#!/usr/bin/env bash
tail -n 0 -f $1 | while read line; do echo "$line"| json -i; done #this is using json-command
#tail -n 0 -f $1 | json -gai; #this is using jsontool
