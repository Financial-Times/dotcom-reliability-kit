#!/usr/bin/env bash

set -euo pipefail

pattern='^([[:alnum:]-]*)-v[[:digit:]]{1,}\.[[:digit:]]{1,}\.[[:digit:]]{1,}(-[[:alpha:]]{1,}\.[[:digit:]]{1,}){0,1}$'
if [[ ! $CIRCLE_TAG =~ $pattern ]]; then
  echo "cannot parse git tag $CIRCLE_TAG from CircleCI"
  exit 1
fi

workspace=${BASH_REMATCH[1]}
if [[ $workspace = 'dotcom-reliability-kit' ]]; then
  echo "top-level dotcom-reliability-kit package should not be published"
  exit 1
else
  workspace="@dotcom-reliability-kit/$workspace"
fi

npm publish --workspace "$workspace" --access=public "$@"
