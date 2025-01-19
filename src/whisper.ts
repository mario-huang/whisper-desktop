import { resolveResource } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { family } from "@tauri-apps/plugin-os";
import { invoke } from "@tauri-apps/api/core";
import { UnlistenFn } from "@tauri-apps/api/event";

export class Whisper {
  port: number | null = null;
  unlistenCloseRequested: UnlistenFn | null = null;

  async start() {
    await this.stop();

    this.port = await this.getPort();
    const whisperPath = await resolveResource("Whisper-WebUI");
    const command = Command.create(
      "sh",
      ["./start-webui.sh", "--inbrowser", "false"],
      {
        cwd: whisperPath,
      }
    );
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
    });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (line) =>
      console.log(`command stdout: "${line}"`)
    );
    command.stderr.on("data", (line) =>
      console.log(`command stderr: "${line}"`)
    );
    await command.spawn();
    console.log(`Whisper started successfully on port ${this.port}.`);

    await this.subscribeCloseRequested();
  }

  async stop() {
    if (this.port === null) {
      return;
    }
    const pid = await this.getPid(this.port);
    let killCommand: Command<string>;
    if (pid) {
      if (this.isWindows()) {
        killCommand = Command.create("taskkill", ["/PID", pid, "/F"]);
      } else {
        killCommand = Command.create("kill", pid);
      }
      await killCommand.execute();
      console.log(`Whisper has been killed on port ${this.port}.`);
    }

    this.unsubscribeCloseRequested();
  }

  async getPid(port: number): Promise<string> {
    let pidCommand: Command<string>;
    if (this.isWindows()) {
      pidCommand = Command.create("powershell", [
        "-Command",
        `Get-NetTCPConnection -LocalPort ${port} | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique`,
      ]);
    } else {
      pidCommand = Command.create("lsof", ["-i", `:${port}`, "-t"]);
    }
    const pid = (await pidCommand.execute()).stdout;
    return pid;
  }

  isWindows(): boolean {
    return family() == "windows";
  }

  async getPort(): Promise<number> {
    return invoke<number>("get_random_port");
  }

  async subscribeCloseRequested() {
    const appWindow = getCurrentWindow();
    this.unlistenCloseRequested = await appWindow.onCloseRequested(
      async (event) => {
        event.preventDefault();
        await this.stop();
        appWindow.close();
      }
    );
  }

  unsubscribeCloseRequested() {
    if (this.unlistenCloseRequested) {
      this.unlistenCloseRequested();
      this.unlistenCloseRequested = null;
    }
  }
}
