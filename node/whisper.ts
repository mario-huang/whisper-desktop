import { app } from "electron";
import path from "node:path";
import axios from "axios";
import fs from "node:fs";
import AdmZip from "adm-zip";
import Store from "electron-store";
import os from "node:os";
import { execFile, execFileSync, execSync } from "node:child_process";
import { detect } from "detect-port";

export class Whisper {
  userDataPath = app.getPath("userData");
  whisperPath = path.join(this.userDataPath, "Whisper-WebUI");

  async start() {
    const whisperInstalledKey = `isWhisperInstalled-${app.getVersion()}`;
    const store = new Store();
    const isWhisperInstalled = store.get(whisperInstalledKey);
    const isWhisperExists = fs.existsSync(this.whisperPath);
    if (!isWhisperExists || !isWhisperInstalled) {
      console.log("Downloading Whisper...");
      await this.download();
      console.log("Whisper downloaded.");
      store.set(whisperInstalledKey, true);
    } else {
    }

    // port = await getPort();
    // const whisperPath = await resolveResource("Whisper-WebUI");
    // const serverName = "localhost";
    // const command = Command.create(
    //   "bash",
    //   [
    //     "./start-webui.sh",
    //     "--server_name",
    //     serverName,
    //     "--server_port",
    //     port.toString(),
    //     "--inbrowser",
    //     "false",
    //   ],
    //   {
    //     cwd: whisperPath,
    //     env: {
    //       PYTHONUNBUFFERED: "1",
    //     },
    //   }
    // );
    // command.on("close", (data) => {
    //   console.log(
    //     `command finished with code ${data.code} and signal ${data.signal}`
    //   );
    // });
    // command.on("error", (error) => {
    //   console.error(`command error: "${error}"`);
    //   toast.error(error);
    // });
    // command.stdout.on("data", (line) => {
    //   console.log(`command stdout: "${line}"`);
    //   if (line.includes(serverName)) {
    //     toast.success(`Whisper is running on port ${port}.`);
    //     // window.location.replace(`http://${serverName}:${port}`);
    //   }
    // });
    // command.stderr.on("data", (line) => {
    //   console.error(`command stderr: "${line}"`);
    //   toast.error(line);
    // });
    // await command.spawn();
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
    fs.rmSync(this.whisperPath, { recursive: true, force: true });
    const url =
      "https://github.com/mario-huang/Whisper-WebUI/tree/603e4f77143e9d4e8fa9e7f8badf5b3e5f01e1bb.zip";
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const zipPath = `${this.whisperPath}.zip`;
    fs.writeFileSync(zipPath, response.data);
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(this.whisperPath, true);
    console.log(`Whisper extracted to ${this.whisperPath}`);

    let osType = "";
    switch (os.type()) {
      case "Linux":
        osType = "linux";
        break;
      case "Darwin":
        osType = "macos";
        break;
      case "Windows_NT":
        osType = "windows";
        break;
      default:
        break;
    }
    console.log(`osType: ${osType}`);

    execFileSync(
      `./install-dependencies-${osType}.sh`,
      {
        cwd: this.whisperPath,
        env: { PYTHONUNBUFFERED: "1" },
      }
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
    );
  }
}
