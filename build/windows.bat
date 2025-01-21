@echo off

npm install

cd .\src-tauri
cargo build

cd ..\Whisper-WebUI
.\Install.bat

cd ..\
npm run tauri build
