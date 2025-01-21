#!/bin/bash

apt update
apt install -y libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

npm install

cd ./src-tauri
cargo build

cd ../Whisper-WebUI
chmod +x ./Install.sh
./Install.sh

cd ../
npm run tauri build
