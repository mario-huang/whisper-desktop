import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("getVersion"),
  startWhisper: () => ipcRenderer.send("startWhisper"),
  onStartWhisper: (callback: (info: string, error?: string) => void) =>
    ipcRenderer.on("onStartWhisper", (_, info, error) => callback(info, error)),
});
