import {app, BrowserWindow, dialog, ipcMain} from "electron"
import path from 'path'
import { fileURLToPath } from "url"
import { isDev } from "./utils.js"
import { spawn } from 'child_process'
import * as fs from 'node:fs';

const isWindows = process.platform === "win32";
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let __submissions_location = ""

app.on("ready", ()=> {
    let pythonPath = ""
    let scriptPath = ""
    let ollamaPath = ""
    let rubricPath = ""

    if (isDev()) {
        const __scriptdirname = path.join(__dirname, '..', 'app-be')
        pythonPath = isWindows
        ? path.join(__scriptdirname, "venv", "Scripts", "python.exe")
        : path.join(__scriptdirname, "venv", "bin", "python");
        
        scriptPath = path.join(__scriptdirname, "main.py")
        ollamaPath = path.join(__scriptdirname, "ollama_code_analysis.py")
        rubricPath = path.join(__scriptdirname, "ollama_rubric_generation.py")
    }else{
        scriptPath = isWindows? path.join(process.resourcesPath, "main.exe") :path.join(process.resourcesPath, "main")
        ollamaPath = isWindows? path.join(process.resourcesPath, "ollama_code_analysis.exe") :path.join(process.resourcesPath, "ollama_code_analysis")
        rubricPath = isWindows? path.join(process.resourcesPath, "ollama_rubric_generation.exe") :path.join(process.resourcesPath, "ollama_rubric_generation")
    }

    const mainWindow = new BrowserWindow({
        width: 1800,
        height: 1000,
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
        const result = await dialog.showOpenDialog(isDev()?{
            properties: ['openDirectory'],
            defaultPath: "/home/pol/projects/GradeMeTestingFolder",
        }:
        {
            properties: ['openDirectory'],
        }
        );
        return result.filePaths;
    })

    ipcMain.on('run-python', (event, {folder1, folder2, language, build, is_separated})=>{
        const python = isDev()? spawn( pythonPath, [scriptPath, folder1 ?? "", folder2 ?? "", language, build, is_separated ,__dirname]):spawn( scriptPath, [folder1 ?? "", folder2 ?? "", language, build??"", is_separated, __dirname], {shell:false})
        let output = ''
        python.stdout.on("data", (result)=>{
            output += result.toString();
            console.log(output)
        })

        python.stderr.on('data', (err)=>{
            event.sender.send('python-error', err.toString());
            console.log(err.toString())
        })
        python.on('close', () => {
        try {
            const { data } = JSON.parse(output);
            console.log(data);
            const reconstruct_path = data[0]['file_path'][0].split("submissions")
            __submissions_location = path.join(reconstruct_path[0], "submissions")
            console.log(__submissions_location)
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
            event.sender.send('codellama-error', err.toString());
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
        const {canceled, filePaths} = await dialog.showOpenDialog({
            title: "Save Submissions",
            properties: ['openDirectory', 'createDirectory']
        })
        if (!canceled && filePaths){
            try{
                await fs.cp(__submissions_location, `${filePaths[0]}/submissions-${Date.now()}`, {recursive: true}, (err)=>{
                    if (err) throw err
                })
            }catch(err){
                event.sender.send("Folder save error", `Failed to save folder ${err}`)
            }
        }
        return filePaths[0]
    })
    ipcMain.handle("dialog:downloadJSON", async (event, data:string) =>{ 
        const {canceled, filePaths} = await dialog.showOpenDialog({
            title: "Save Submissions (JSON)",
            properties: ['openDirectory', 'createDirectory']
        })
        if (!canceled && filePaths){
            try{
                await fs.writeFile(`${filePaths}/test_results-${Date.now()}.json`, data,  (err) => {
                    if (err) throw err;
                    console.log('The file has been saved!');
                })
            }catch(err){
                event.sender.send("Write file error", `Failed to save file ${err}`)
            }
        }
        return filePaths[0]
    })
    ipcMain.handle('fileReader', async(_, path)=>{
        if (!path) {
            console.error("NO PATH RECEIVED")
            return null
        }

        if (!fs.existsSync(path)) {
            console.error("FILE DOES NOT EXIST:", path)
            return null
        }
        const code:string = fs.readFileSync(path, "utf-8")
        return  code
    .replace(/\t/g, "    ")
    .replace(/\r\n/g, "\n")
    .trimEnd()
    })

    ipcMain.on('run-ollama-rubric', (event, {points, about, important, unimportant})=>{
        const python = isDev()? spawn(pythonPath, [rubricPath, points, about, important, unimportant]):spawn(rubricPath, [points, about, important, unimportant], {shell:false})
        let output = ''
        python.stdout.on("data", (result)=>{
            output += result.toString();
        })

        python.stderr.on('data', (err)=>{
            event.sender.send('rubric-error', err.toString());
            console.log(err.toString())
        })
        python.on('error', (err) => {
            const errorMsg = `Failed to start process: ${err.message}\nPath: ${rubricPath}\nCode: ${err.toString() || 'N/A'}`;
            console.error(errorMsg);
            event.sender.send('rubric-error', errorMsg);
        })
        python.on('close', (code) => {
        try {
            const data = output;
            if (code !== 0 && !output) {
                event.sender.send('rubric-result', `Process exited with code ${code} and no output. Path: ${rubricPath}`);
                return;
            }
            event.sender.send('rubric-result', data);
        } catch (err) {
            event.sender.send('rubric-result', `Failed to parse output: ${err}`);
            console.log(err)
        }
        })
    })
})

app.on('will-quit', (e)=>{
    e.preventDefault()
    if (fs.existsSync(__submissions_location)){
        try{
            fs.rm(__submissions_location, { recursive: true, force: true }, (err)=>{
                console.error('Failed to delete log file:', err);
            });
        } catch (error) {
            console.error('Failed to delete log file:', error);
        }
    }  
})