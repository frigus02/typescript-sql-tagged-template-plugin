#!/bin/sh
set -e

yarn
yarn generate-pg-query-emscripten-types
exec yarn compile --watch
