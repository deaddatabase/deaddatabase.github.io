#!/bin/bash

# Make scrpit

i=0
for var in $@
do
  if [[ $var == *"min."* ]]
      then
    continue
  fi
        end=${var##*.}
  n=${#end}
  let "n++"
        echo $var to ${var:0:(-$n)}".min"${var:(-$n)}
  ./jsmin <$var>${var:0:(-$n)}".min"${var:(-$n)}
done
