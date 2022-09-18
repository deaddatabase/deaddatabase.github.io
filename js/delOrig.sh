#!/bin/bash

# Make scrpit

i=0
for var in $@
do
  if [[ $var == *"min."* ]]
      then
    continue
  fi
  echo Removing $var
        rm $var
done
