#!/usr/bin/env bash

find ./packages/fetch-error-handler -name "*.d.ts*" | xargs -r rm
find ./packages/logger -name "*.d.ts*" | xargs -r rm
