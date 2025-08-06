import { useState } from 'react'
import spinner from '../assets/source.gif'
import Results from './pages/Results.js'

const Home = () =>{
  const [folder1, setFolder1] = useState<string | undefined>()
  const [folder2, setFolder2] = useState<string | undefined>()
  const [data, setData] = useState<Results[]>()
  const [error, setError] = useState<string | undefined> ()
  const [waiting, setWaiting] = useState<boolean>(false)
  const [showResults, setShowResults] = useState<boolean>(false)
  
  const openFolder = async(folder:string) =>{
    const filePath = await window.electronAPI.openFolder()
    if (filePath != undefined){
      if (folder === "folder1")
        setFolder1(filePath)
      else
        setFolder2(filePath)
    }
  }

  const runScript = async()=>{
    setWaiting(true)
    try {
      const result = await window.electronAPI.runScript(folder1, folder2);
      if (result) {
        setWaiting(false)
      }
      setData(result); // assuming Python returns {"data": ...}
      
    } catch (err) {
      setWaiting(false)
      setError(String(err));
    }
  }
  return (
    <>
    <div id="home">
    {showResults?
    <Results data={data ?? []} setShowResults={setShowResults}/>
    :
    <div>
    <pre>
 ░▒▓██████▓▒░░▒▓███████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░░▒▓████████▓▒░▒▓██████████████▓▒░░▒▓████████▓▒░ <br></br>
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        <br></br>
░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        <br></br>
░▒▓█▓▒▒▓███▓▒░▒▓███████▓▒░░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓██████▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓██████▓▒░   <br></br>
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        <br></br>
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        <br></br>
 &nbsp;░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░ <br></br>
    </pre>                                                                                        
                                                                                                    
                                                                                                    
      <div id="mainButtons">
        <div className='buttonAndLink'>
          <button onClick={()=>openFolder("folder1") } className='selectButton'>Select Submissions Folder</button>
            <div className="inLine">
              {folder1 && folder1.length > 0 && 
              <>
              <p>{folder1}</p>
              <button className="deleteBtn" onClick={()=>setFolder1(undefined)}>X</button>
              </>} 
          </div>
        </div>
        <div className='buttonAndLink'>
          <button onClick={()=>openFolder("folder2") } className='selectButton'>Select Testing Folder</button>
          <div className="inLine">
            {folder2 && folder2.length > 0 && 
            <>
            <p>{folder2}</p>
            <button className="deleteBtn" onClick={()=>setFolder2(undefined)}>X</button>
            </>}
            
          </div>
        </div>
      </div>
      {
        !waiting ? 
          
            !folder1 || !folder2  ?
              <button disabled>Grade</button>
              :
              <button onClick={runScript}>Grade</button>
          :
          ""
      }
      {
        waiting&&
        <img width="200" src={spinner}></img>
      }
      {
        !waiting && data&&
        <>
        <button id="resButton" onClick={()=>setShowResults(true)}>Show Results</button>
        <button title="Download a folder containing submissions sorted by student name" onClick={()=>setShowResults(true)}>Download Sorted</button>
        </>
      }
      {error&&
      <p>
        error
      </p>
      }
      </div>
  }
    </div>
    </>
  )
}

export default Home