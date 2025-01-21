@echo off

call npm install
call cd .\src-tauri
call cargo build
call cd ..\Whisper-WebUI
call .\Install.bat
call cd ..\
call npm run tauri build
