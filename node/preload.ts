import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('getVersion')
  startWhisper: () => ipcRenderer.invoke('startWhisper')
})