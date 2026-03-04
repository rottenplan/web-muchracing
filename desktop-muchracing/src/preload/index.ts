import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openFile: (options: any) => ipcRenderer.invoke('dialog:openFile', options),
  saveFile: (options: any) => ipcRenderer.invoke('dialog:saveFile', options),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  exportStart: (options: any) => ipcRenderer.invoke('export:start', options),
  exportFrame: (frameData: string) => ipcRenderer.invoke('export:frame', frameData),
  exportFinish: () => ipcRenderer.invoke('export:finish')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
