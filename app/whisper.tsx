import { useRef, useState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";

export function useWhisper() {
  const isRunningRef = useRef(false);
  const [info, setInfo] = useState("");

  window.electronAPI.onStartWhisper((data) => {
    setInfo(data);
  });

  useEffect(() => {
    if (isRunningRef.current) {
      return;
    }
    isRunningRef.current = true;
    start();
  }, []);

  async function start() {
    window.electronAPI.startWhisper();
  }

  return info;

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

  // async function getPort(): Promise<number> {
  //   return invoke<number>("get_random_port");
  // }

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

  // async function installDependencies() {
  //   const whisperPath = await resolveResource("Whisper-WebUI");
  //   const osType = type();
  //   console.log(`osType: ${osType}`);
  //   const command = Command.create(
  //     "bash",
  //     [`./install-dependencies-${osType}.sh`],
  //     {
  //       cwd: whisperPath,
  //       env: {
  //         PYTHONUNBUFFERED: "1",
  //       },
  //     }
  //   );
  //   command.on("close", (data) => {
  //     console.log(
  //       `command finished with code ${data.code} and signal ${data.signal}`
  //     );
  //   });
  //   command.on("error", (error) => {
  //     console.error(`command error: "${error}"`);
  //     toast.error(error);
  //   });
  //   command.stdout.on("data", (line) => {
  //     console.log(`command stdout: "${line}"`);
  //   });
  //   command.stderr.on("data", (line) => {
  //     console.error(`command stderr: "${line}"`);
  //     toast.error(line);
  //   });
  //   await command.execute();
  // }

  // return info;
}
