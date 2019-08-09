#!/bin/sh
set -e

yarn
yarn generate-pg-query-native-types
exec yarn compile --watch
