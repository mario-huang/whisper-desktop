import { resolveResource } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import { Command } from "@tauri-apps/plugin-shell";
// import { getCurrentWindow } from "@tauri-apps/api/window";
// import { family } from "@tauri-apps/plugin-os";
import { invoke } from "@tauri-apps/api/core";
// import { UnlistenFn } from "@tauri-apps/api/event";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { LazyStore } from "@tauri-apps/plugin-store";
import { platform } from "@tauri-apps/plugin-os";

export function useWhisper() {
  const isRunningRef = useRef(false);
  const [info, setInfo] = useState("");
  // const appWindow = getCurrentWindow();
  // let unlistenCloseRequested: UnlistenFn | null = null;
  let port = 0;

  useEffect(() => {
    if (isRunningRef.current) {
      return;
    }
    isRunningRef.current = true;
    start();
  }, []);

  async function start() {
    const store = new LazyStore("store.json");
    const isiDependenciesInstalled = await store.get(
      "isiDependenciesInstalled"
    );
    const venvPath = await resolveResource("Whisper-WebUI/venv");
    const isVenvExists = await exists(venvPath);
    if (!isVenvExists || !isiDependenciesInstalled) {
      console.log("Installing Whisper dependencies...");
      setInfo(
        "Installing Whisper dependencies.\nThis will take a few minutes."
      );
      await installDependencies();
      await store.set("isiDependenciesInstalled", true);
      console.log("Whisper dependencies installed.");
      setInfo("Whisper will start in a few minutes.");
    } else {
      setInfo("Whisper will start in a few seconds.");
    }

    port = await getPort();
    const whisperPath = await resolveResource("Whisper-WebUI");
    const serverName = "localhost";
    const command = Command.create(
      "bash",
      [
        "./start-webui.sh",
        "--server_name",
        serverName,
        "--server_port",
        port.toString(),
        "--inbrowser",
        "false",
      ],
      {
        cwd: whisperPath,
        env: {
          PYTHONUNBUFFERED: "1",
        },
      }
    );
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
    });
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      toast.error(error);
    });
    command.stdout.on("data", (line) => {
      console.log(`command stdout: "${line}"`);
      if (line.includes(serverName)) {
        toast.success(`Whisper is running on port ${port}.`);
        // window.location.replace(`http://${serverName}:${port}`);
      }
    });
    command.stderr.on("data", (line) => {
      console.log(`command stderr: "${line}"`);
      toast.error(line);
    });
    await command.spawn();
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

  async function getPort(): Promise<number> {
    return invoke<number>("get_random_port");
  }

  // async function subscribeCloseRequested() {
  //   this.unlistenCloseRequested = await this.appWindow.onCloseRequested(
  //     async (event) => {
  //       event.preventDefault();
  //       await this.stop();
  //       this.appWindow.close();
  //     }
  //   );
  // }

  // function unsubscribeCloseRequested() {
  //   if (this.unlistenCloseRequested) {
  //     this.unlistenCloseRequested();
  //     this.unlistenCloseRequested = null;
  //   }
  // }

  async function installDependencies() {
    const whisperPath = await resolveResource("Whisper-WebUI");
    const currentPlatform = platform();
    const command = Command.create("bash", [`./install-dependencies-${currentPlatform}.sh`], {
      cwd: whisperPath,
      env: {
        PYTHONUNBUFFERED: "1",
      },
    });
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
    });
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      toast.error(error);
    });
    command.stdout.on("data", (line) => {
      console.log(`command stdout: "${line}"`);
    });
    command.stderr.on("data", (line) => {
      console.log(`command stderr: "${line}"`);
      toast.error(line);
    });
    await command.execute();
  }

  return info;
}
