import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("getVersion"),
  startWhisper: () => ipcRenderer.send("startWhisper"),
  onStartWhisper: (callback: (data: string) => void) =>
    ipcRenderer.on("onStartWhisper", (event, data) => callback(data)),
});
