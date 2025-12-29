#!/usr/bin/env bash
set -e

# Ensure dependencies are installed (idempotent on Railway)
if [ ! -d node_modules ]; then
  npm install
fi

npm start

