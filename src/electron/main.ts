import {app, BrowserWindow, dialog, ipcMain} from "electron"
import path from 'path'
import { fileURLToPath } from "url"
import { isDev } from "./utils.js"
import { spawn } from 'child_process'
import * as fs from 'node:fs';

const isWindows = process.platform === "win32";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.on("ready", ()=> {
    // const __scriptdirname = path.join(__dirname, '..', 'app-be')

    // const pythonPath = isWindows
    // ? path.join(__dirname, "main.exe")
    // : path.join(__dirname, "venv", "bin", "python");
    const scriptPath = isWindows? path.join(process.resourcesPath, "main.exe") :path.join(process.resourcesPath, "main")
    const ollamaPath = isWindows? path.join(process.resourcesPath, "ollama_code_analysis.exe") :path.join(process.resourcesPath, "ollama_code_analysis")

    const mainWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        webPreferences:{
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true,
        }
    })
    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123')
    }else{
        mainWindow.setMenuBarVisibility(false)
        mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"))
    }

    ipcMain.handle('dialog:openFolder', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });
        console.log('here')
        return result.filePaths;
    })

    ipcMain.on('run-python', (event, {folder1, folder2})=>{
        const python = spawn(scriptPath, [folder1 ?? "", folder2 ?? ""], {shell:false})
        let output = ''
        python.stdout.on("data", (result)=>{
            output += result.toString();
        })

        python.stderr.on('data', (err)=>{
            event.sender.send('python-error', err.toString());
        })
        python.on('close', () => {
        try {
        const { data } = JSON.parse(output);
        event.sender.send('python-result', data);
        } catch (err) {
        event.sender.send('python-error', `Failed to parse output: ${err}`);
        }
    });
    })

    ipcMain.on('run-codellama', (event, {path, rubric})=>{
        const python = spawn(ollamaPath, [path, rubric], {shell:false})
        let output = ''
         python.stdout.on("data", (result)=>{
            output += result.toString();
        })

        python.stderr.on('data', (err)=>{
            event.sender.send('python-error', err.toString());
        })
        python.on('close', () => {
        try {
            const data = output;
            event.sender.send('codellama-result', data);
        } catch (err) {
            event.sender.send('codellama-error', `Failed to parse output: ${err}`);
        }
        })
    })
})



app.on('will-quit', async(e)=>{
    e.preventDefault()
    const __subdirname = path.join(__dirname, '..', 'submissions')
    console.log(fs.existsSync(__subdirname))
    if (fs.existsSync(__subdirname) === true){

        await fs.rm(__subdirname, { recursive: true },  (err)=>{
            if (err) throw err
            console.log("Deleted submissions file")
        })
    }   
})