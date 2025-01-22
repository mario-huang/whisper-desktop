#!/bin/bash

if command -v apt > /dev/null 2>&1; then
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
./Install.sh

cd ../
npm run tauri build

