#!/bin/bash

set -e
export branch="deploy-$(date +%s)"
export current=`git rev-parse HEAD`

git checkout -b $branch
npm install
webpack
git add -f assets/*
git commit -m"Add compiled UIs for deploy"
git push deploy $branch:master
git tag -f deployed $current
git push origin --tags