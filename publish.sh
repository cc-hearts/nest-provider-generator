#! /bin/bash

npm config set registry https://registry.npmjs.org

# npm publish --access=public
npm publish --access=public

npm config set registry https://registry.npmmirror.com