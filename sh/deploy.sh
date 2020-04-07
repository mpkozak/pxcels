#!/bin/bash



# start timestamp
  t=`date +%s`

# absolute path of repo
  TOPLEVEL=$(git rev-parse --show-toplevel)
  cd "$TOPLEVEL"

# create new branch
  git checkout -b prod

# modify gitignore
  echo client >> .gitignore
  echo !public >> .gitignore

# add build version to package.json
  VERSION=$(cat "$TOPLEVEL/package.json" \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]')
  BUILD_VERSION="$VERSION--$t"
  sed -i '' -e "s/$VERSION/$BUILD_VERSION/" "$TOPLEVEL/package.json"

# commit changes
  git add .
  git commit -m "deploy to heroku $BUILD_VERSION"




#   cd "$TOPLEVEL/client"
#   npm run build

# # check for public dir
#   cd "$TOPLEVEL"
#   if [ ! -d "$TOPLEVEL/public" ]; then
#     mkdir "$TOPLEVEL/public"
#   fi

# # copy build into public dir
#   rm -rf "$TOPLEVEL/public/*"
#   cp -r "$TOPLEVEL/client/build/" "$TOPLEVEL/public"

# # exit
#   exit 0
