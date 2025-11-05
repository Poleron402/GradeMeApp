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
    let pythonPath = ""
    let scriptPath = ""
    let ollamaPath = ""
    if (isDev()) {
        const __scriptdirname = path.join(__dirname, '..', 'app-be')
        pythonPath = isWindows
        ? path.join(__scriptdirname, "venv", "Scripts", "python.exe")
        : path.join(__scriptdirname, "venv", "bin", "python");
        
        scriptPath = path.join(__scriptdirname, "main.py")
        ollamaPath = path.join(__scriptdirname, "ollama_code_analysis.py")

    }else{
        scriptPath = isWindows? path.join(process.resourcesPath, "main.exe") :path.join(process.resourcesPath, "main")
        ollamaPath = isWindows? path.join(process.resourcesPath, "ollama_code_analysis.exe") :path.join(process.resourcesPath, "ollama_code_analysis")
    }

    const mainWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        webPreferences:{
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
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
        return result.filePaths;
    })

    ipcMain.on('run-python', (event, {folder1, folder2, language, build, is_separated})=>{
        const python = isDev()? spawn( pythonPath, [scriptPath, folder1 ?? "", folder2 ?? "", language, build??"", is_separated]):spawn( scriptPath, [folder1 ?? "", folder2 ?? "", language, build??"", is_separated], {shell:false})
        let output = ''
        python.stdout.on("data", (result)=>{
            output += result.toString();
            console.log(output)
        })

        python.stderr.on('data', (err)=>{
            event.sender.send('python-error', err.toString());
        })
        python.on('close', () => {
        try {
            const { data } = JSON.parse(output);
            console.log(data)
            event.sender.send('python-result', data);
        } catch (err) {
            event.sender.send('python-error', `Failed to parse output: ${err}`);
            console.error(`CAUGHT: ${err}`)
            console.error(output)
        }
    });
    })

    ipcMain.on('run-codellama', (event, {path, rubric})=>{
        const python = isDev()? spawn(pythonPath, [ollamaPath, path, rubric]):spawn(ollamaPath, [path, rubric], {shell:false})
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

    ipcMain.handle("dialog:downloadFolder", async (event) =>{
        const __subdirname = path.join(__dirname, '..', 'submissions')
        const {canceled, filePaths} = await dialog.showOpenDialog({
            title: "Save Submissions",
            properties: ['openDirectory', 'createDirectory']
        })
        if (!canceled && filePaths){
            try{
                await fs.cp(__subdirname, `${filePaths[0]}/submissions-${Date.now()}`, {recursive: true}, (err)=>{
                    if (err) throw err
                })
            }catch(err){
                event.sender.send("Folder save error", `Failed to save folder ${err}`)
            }
        }
        return filePaths[0]
    })
})



app.on('will-quit', async(e)=>{
    e.preventDefault()
    const __subdirname = path.join(__dirname, '..', 'submissions')
    if (fs.existsSync(__subdirname) === true){

        await fs.rm(__subdirname, { recursive: true },  (err)=>{
            if (err) throw err
        })
    }   
})