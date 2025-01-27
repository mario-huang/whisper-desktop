import { contextBridge, ipcRenderer } from "electron";
import { on } from "node:events";

contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("getVersion"),
  startWhisper: () => ipcRenderer.send("startWhisper"),
  onStartWhisper: (callback: () => ) => ipcRenderer.on('onStartWhisper', (_, value) => callback(value))
});
