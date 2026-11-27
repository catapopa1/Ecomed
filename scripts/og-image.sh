#!/bin/sh
# Share image: screenshot /dev/og/ (needs `npm run dev` on :4410) to public/og/home.jpg at 1200×630.
set -e
mkdir -p public/og
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --virtual-time-budget=4000 --screenshot="$PWD/public/og/home.png" http://localhost:4410/dev/og/ 2>/dev/null
sips -s format jpeg -s formatOptions 88 public/og/home.png --out public/og/home.jpg >/dev/null && rm public/og/home.png
echo "public/og/home.jpg"
