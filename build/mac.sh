#!/bin/bash

npm install
cargo ./src-tauri/build
./Whisper-WebUI/Install.sh
npm run tauri build
