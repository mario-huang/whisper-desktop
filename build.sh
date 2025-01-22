#!/bin/bash

if [[ "$MATRIX_OS" == ubuntu-* ]]; then
  sudo apt update
  sudo apt install -y libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
fi

npm install

cd ./src-tauri
cargo build

cd ../Whisper-WebUI
if [[ "$MATRIX_OS" == macos-* ]]; then
  sed -i '' 's|^\(--extra-index-url.*\)|# \1|' requirements.txt
# elif [[ "$MATRIX_OS" == *-arm ]]; then
#   sed -i 's|^\(--extra-index-url.*\)|# \1|' requirements.txt
fi
./Install.sh

cd ../
npm run tauri build

