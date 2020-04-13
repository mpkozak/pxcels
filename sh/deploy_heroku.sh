#!/bin/bash



# start timestamp
  t=`date +%s`

# absolute path of repo
  TOPLEVEL=$(git rev-parse --show-toplevel)
  BR=$(git rev-parse --abbrev-ref HEAD)
  cd "$TOPLEVEL"

# create new branch
  git checkout -b heroku_deploy

# modify gitignore
  sed -i '' -e "s/\!client\/public//" .gitignore
  sed -i '' -e "s/client\/build/client/" .gitignore
  sed -i '' -e "s/public//" .gitignore
  echo sh >> .gitignore

# add build version to package.json
  VERSION=$(cat "$TOPLEVEL/package.json" \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]')
  BUILD_VERSION="$VERSION--$t"
  sed -i '' -e "s/$VERSION/$BUILD_VERSION/" "$TOPLEVEL/package.json"

# change client homepage
  sed -i '' -e "s/homepage_heroku/homepage/" "$TOPLEVEL/client/package.json"

# build client
  cd "$TOPLEVEL/client"
  npm run build

# check for public dir
  cd "$TOPLEVEL"
  if [ ! -d "$TOPLEVEL/public" ]; then
    mkdir "$TOPLEVEL/public"
  else
    rm -rf "$TOPLEVEL/public/"
  fi

# copy build into public dir
  cp -r "$TOPLEVEL/client/build/" "$TOPLEVEL/public"

# commit changes
  git add .
  git commit -m "deploy to heroku $BUILD_VERSION"

# deploy
  git push --force heroku heroku_deploy:master

# switch back to master branch
  git checkout "$BR"

# delete deployment branch
  git branch -D heroku_deploy

# calculate runtime
  convertsecs() {
    ((h=${1}/3600))
    ((m=(${1}%3600)/60))
    ((s=${1}%60))
    printf "%02d:%02d:%02d" $h $m $s
  }

  s=$((`date +%s`-t))
  RT=$(convertsecs $s)

# report success
  printf "\n\nDeployment successful! --- $RT elapsed\n\n\n"
  exit 0
