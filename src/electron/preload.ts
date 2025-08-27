import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    openFolder: ()=>ipcRenderer.invoke('dialog:openFolder'),
    runScript: (folder1:string, folder2:string)=> new Promise((resolve, reject) => {
      ipcRenderer.once('python-result', (_event, data) => resolve(data));
      ipcRenderer.once('python-error', (_event, error) => reject(new Error(error)));

      ipcRenderer.send('run-python', { folder1, folder2 });
    }),
    runOllama: (path:string, rubric:string)=>new Promise((resolve, reject)=>{
      ipcRenderer.once('codellama-result', (_event, data) => resolve(data));
      ipcRenderer.once('codellama-error', (_event, error) => reject(new Error(error)));

      ipcRenderer.send('run-codellama', { path, rubric });
    }),
    downloadFolder: ()=>ipcRenderer.invoke('dialog:downloadFolder'),
})