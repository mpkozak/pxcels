#!/bin/bash



# start timestamp
  t=`date +%s`

# import environment variables
  if [ -f sh/.env-sh ]; then
    . sh/.env-sh
  fi

# absolute path of repo
  TOPLEVEL=$(git rev-parse --show-toplevel)

# backup package.json
  cp "$TOPLEVEL/client/package.json" "$TOPLEVEL/client/package.json.bak"

# change client homepage
  sed -i '' -e "s/homepage_kozak/homepage/" "$TOPLEVEL/client/package.json"

# build client
  cd "$TOPLEVEL/client"
  npm run build_kozak

# revert package.json
  mv "$TOPLEVEL/client/package.json.bak" "$TOPLEVEL/client/package.json"

# push to remote
  rsync -avzPh --delete --exclude={'*.DS_Store','*precache-manifest*','service-worker.js'} "$TOPLEVEL/client/build/" "$SERVER:$DEST"

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
