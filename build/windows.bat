#!/bin/bash

if command -v apt &> /dev/null; then
  echo "Detected Linux system with apt. Installing dependencies..."
  
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

  echo "Dependencies installed successfully."
else
  echo "This script is only for Linux systems with apt. Skipping dependency installation."
fi

npm install

cd ./src-tauri
cargo build

cd ../Whisper-WebUI
if [[ "${{ matrix.os }}" == macos* ]]; then
  sed -i '' 's|^\(--extra-index-url.*\)|# \1|' requirements.txt
fi
if [[ "${{ matrix.os }}" == windows* ]]; then
  ./Install.bat
else
  chmod +x ./Install.sh
  ./Install.sh
fi

npm run tauri build


