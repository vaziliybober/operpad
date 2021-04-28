#!/bin/bash

output="$(npx prettier --check . 2>&1 > /dev/null)"
echo "$output"
if [[ "$output" == *"warn"* ]]; then
  echo "Fix prettier warnings first!"
  exit 1
else
  echo "All good!"
fi