#!/bin/bash



# absolute path of repo
  TOPLEVEL=$(git rev-parse --show-toplevel)

# build client
  cd "$TOPLEVEL/client"
  npm run build

# check for public dir
  cd "$TOPLEVEL"
  if [ ! -d "$TOPLEVEL/public" ]; then
    mkdir "$TOPLEVEL/public"
  fi

# copy build into public dir
  rm -rf "$TOPLEVEL/public/*"
  cp -r "$TOPLEVEL/client/build/" "$TOPLEVEL/public"

# exit
  exit 0
