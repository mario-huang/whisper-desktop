import { app, IpcMainEvent } from "electron";
import path from "node:path";
import axios from "axios";
import fs from "node:fs";
import AdmZip from "adm-zip";
import Store from "electron-store";
import os from "node:os";
import { spawn } from "node:child_process";
import { detect } from "detect-port";

export class Whisper {
  userDataPath = app.getPath("userData");
  repository = "Whisper-WebUI";
  hash = "a380697283635148ac69c94e5c597c184a53d224";
  dirName = `${this.repository}-${this.hash}`;
  whisperPath = path.join(this.userDataPath, this.dirName);

  osType = "";

  constructor() {
    switch (os.type()) {
      case "Linux":
        this.osType = "linux";
        break;
      case "Darwin":
        this.osType = "macos";
        break;
      case "Windows_NT":
        this.osType = "windows";
        break;
      default:
        break;
    }
  }

  async start(event: IpcMainEvent) {
    const whisperInstalledKey = this.dirName;
    const store = new Store();
    const isWhisperInstalled = store.get(whisperInstalledKey);
    const isWhisperExists = fs.existsSync(this.whisperPath);
    if (!isWhisperExists || !isWhisperInstalled) {
      try {
        console.log("Downloading Whisper.");
        event.reply(
          "onStartWhisper",
          "Downloading Whisper.\nThis will take a few minutes."
        );
        await this.download();
        store.set(whisperInstalledKey, true);
        console.log("Whisper downloaded.");
        event.reply("onStartWhisper", "Whisper will start in a few minutes.");
      } catch (error) {
        console.error(`Error downloading Whisper: ${error}`);
        event.reply(
          "onStartWhisper",
          `Something went wrong while downloading Whisper.\n${error}`
        );
      }
    } else {
      event.reply("onStartWhisper", "Whisper will start in a few seconds.");
    }

    const port = await this.getPort();
    console.log(`Port: ${port}`);

    const child = spawn(
      "./venv/bin/python",
      [
        "app.py",
        "--server_port",
        `${port}`,
        "--inbrowser",
        "false",
      ],
      {
        cwd: this.whisperPath,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        },
      }
    );
    child.stdout.on("data", (data) => {
      console.log(`[stdout]: ${data}`);
      if (`${data}`.includes("Running on local URL")) {
        event.reply(
          "onStartWhisper",
          `http://localhost:${port}`
        );
      }
    });

    child.stderr.on("data", (data) => {
      console.error(`[stderr]: ${data}`);
    });
    child.on("close", (code) => {
      console.log(`Script exited with code ${code}`);
      if (code === 0) {
        console.log("Script executed successfully!");
      } else {
        console.error("Script execution failed!");
        event.reply(
          "onStartWhisper",
          `Something went wrong while starting Whisper.\n${code}`
        );
      }
    });
  }

  // async function stop() {
  //   const pid = await getPid(port);
  //   let killCommand: Command<string>;
  //   if (pid) {
  //     if (isWindows()) {
  //       killCommand = Command.create("taskkill", ["/PID", pid, "/F"]);
  //     } else {
  //       killCommand = Command.create("kill", pid);
  //     }
  //     await killCommand.execute();
  //     console.log(`Whisper has been killed on port ${port}.`);
  //   }
  // }

  // async function getPid(port: number): Promise<string> {
  //   let pidCommand: Command<string>;
  //   if (isWindows()) {
  //     pidCommand = Command.create("powershell", [
  //       "-Command",
  //       `Get-NetTCPConnection -LocalPort ${port} | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique`,
  //     ]);
  //   } else {
  //     pidCommand = Command.create("lsof", ["-i", `:${port}`, "-t"]);
  //   }
  //   const pid = (await pidCommand.execute()).stdout;
  //   return pid;
  // }

  // function isWindows(): boolean {
  //   return family() == "windows";
  // }

  async getPort(): Promise<number> {
    return await detect();
  }

  async download() {
    const items = fs.readdirSync(this.userDataPath);
    for (const item in items) {
      const fullPath = path.join(this.userDataPath, item);
      if (item.startsWith(this.repository)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    }

    const url = `https://github.com/mario-huang/${this.repository}/archive/${this.hash}.zip`;
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const zipPath = `${this.whisperPath}.zip`;
    fs.writeFileSync(zipPath, response.data);

    const zip = new AdmZip(zipPath);
    const extractPath = `${this.whisperPath}-temp`;
    zip.extractAllTo(extractPath, true, true);
    fs.renameSync(path.join(extractPath, this.dirName), this.whisperPath);

    const child = spawn("bash", [`./install-dependencies-${this.osType}.sh`], {
      cwd: this.whisperPath,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
      },
    });

    return new Promise((resolve, reject) => {
      child.stdout.on("data", (data) => {
        console.log(`[stdout]: ${data}`);
      });

      child.stderr.on("data", (data) => {
        console.error(`[stderr]: ${data}`);
      });

      child.on("close", (code) => {
        console.log(`Script exited with code ${code}`);
        if (code === 0) {
          console.log("Script executed successfully!");
          resolve(code);
        } else {
          console.error("Script execution failed!");
          reject(code);
        }
      });
    });

    // execFileSync(
    //   `./install-dependencies-${osType}.sh`,
    //   {
    //     cwd: this.whisperPath,
    //     env: {
    //       ...process.env,
    //       PYTHONUNBUFFERED: "1",
    //     },
    //   }
    // (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`Error executing script: ${error.message}`);
    //     return;
    //   }
    //   if (stderr) {
    //     console.error(`Script stderr: ${stderr}`);
    //     return;
    //   }
    //   console.log(`Script output: ${stdout}`);
    // }
    // );
  }
}
