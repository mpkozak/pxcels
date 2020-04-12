#!/bin/bash



# absolute path of repo
  TOPLEVEL=$(git rev-parse --show-toplevel)

# change client homepage
  sed -i '' -e "s/homepage_kozak/homepage/" "$TOPLEVEL/client/package.json"

# build client
  cd "$TOPLEVEL/client"
  npm run build_kozak

# check for public dir
  cd "$TOPLEVEL"
  if [ ! -d "$TOPLEVEL/public" ]; then
    mkdir "$TOPLEVEL/public"
  fi

# copy build into public dir
  rm -rf "$TOPLEVEL/public/*"
  cp -r "$TOPLEVEL/client/build/" "$TOPLEVEL/public"

# revert client homepage
  sed -i '' -e "s/homepage/homepage_kozak/" "$TOPLEVEL/client/package.json"

# open build folder
  open "$TOPLEVEL/public"

# exit
  exit 0
