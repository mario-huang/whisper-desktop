#!/bin/bash

npm install

cd ./src-tauri
cargo build

cd ../Whisper-WebUI
chmod +x ./Install.sh
./Install.sh

cd ../
npm run tauri build
