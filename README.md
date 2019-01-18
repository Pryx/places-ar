# Places AR

![Screenshot](https://sajdl.com/data/img/CHROME.png "Screenshot")

This is the app made for the software project and my bachelor thesis. The goal is to make a simple web app that can help you find your desired point of interest using Augmented reality and Device APIs such as DeviceOrientation API. All browser implementations are not made the same, so we have to apply north-detection for browsers such as Mozilla Firefox that do not provide absolute position values.

There is no build system yet, so you can just unpack and run it. Don't fret if you don't have a PHP server at hand, just rename the `index.php` to `index.html` - the php is just a hack to make it run on Heroku :slightly_smiling_face:

A SSL certificate is needed for this to function correctly, because Location API needs secure connection to work :wink:
