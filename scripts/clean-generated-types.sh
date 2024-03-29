#!/usr/bin/env bash

find ./packages/crash-handler -name "*.d.ts*" | xargs -r rm
find ./packages/errors -name "*.d.ts*" | xargs -r rm
find ./packages/fetch-error-handler -name "*.d.ts*" | xargs -r rm
find ./packages/log-error -name "*.d.ts*" | xargs -r rm
find ./packages/logger -name "*.d.ts*" | xargs -r rm
find ./packages/middleware-log-errors -name "*.d.ts*" | xargs -r rm
find ./packages/middleware-render-error-info -name "*.d.ts*" | xargs -r rm
find ./packages/opentelemetry -name "*.d.ts*" | xargs -r rm
