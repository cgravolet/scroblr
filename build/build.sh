#!/bin/bash


# SAFARI
echo "Building Safari extension..."
rm -rf *.safariext*
cp -R ../extension scroblr.safariextension
rm -rf scroblr.safariextension/js/*.js
# Remove chrome-only files
rm scroblr.safariextension/manifest.json
rm scroblr.safariextension/scroblr-popup.html
# Minify scripts
echo "Minifying..."
java -jar compiler.jar --js=../extension/js/scroblr-background.js --js_output_file=scroblr.safariextension/js/scroblr-background.js
java -jar compiler.jar --js=../extension/js/scroblr-bar.js --js_output_file=scroblr.safariextension/js/scroblr-bar.js
java -jar compiler.jar --js=../extension/js/scroblr-injection.js --js_output_file=scroblr.safariextension/js/scroblr-injection.js


# CHROME
echo "Building Chrome extension..."
rm scroblr.zip
rm -rf scroblr-chrome
cp -R ../extension/ scroblr-chrome
# Remove safari-only files
rm scroblr-chrome/Info.plist
rm scroblr-chrome/Settings.plist
rm scroblr-chrome/icon-48.png
rm scroblr-chrome/scroblr-bar.html
rm scroblr-chrome/js/scroblr-bar.js
# Minify scripts
echo "Minifying..."
java -jar compiler.jar --js=../extension/js/scroblr-background.js --js_output_file=scroblr-chrome/js/scroblr-background.js
java -jar compiler.jar --js=../extension/js/scroblr-popup.js --js_output_file=scroblr-chrome/js/scroblr-popup.js
java -jar compiler.jar --js=../extension/js/scroblr-injection.js --js_output_file=scroblr-chrome/js/scroblr-injection.js
zip -r scroblr.zip scroblr-chrome
