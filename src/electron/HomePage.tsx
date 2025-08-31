import { useState } from 'react'
import spinner from '../assets/source.gif'
import Results from './pages/Results.js'
import { GMASCII } from './components/GMASCII.js'

const Home = () =>{
  const [folder1, setFolder1] = useState<string | undefined>()
  const [folder2, setFolder2] = useState<string | undefined>()
  const [language, setLanguage] = useState<string>("Java")
  const [build, setBuild] = useState<string|undefined>("gradle")
  const [separated, setSeparated] = useState<boolean>(false)
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
  const saveSortedSubmissions = async() =>{
    try{
      await window.electronAPI.downloadFolder()
    }catch (err){
      alert(`Issues saving a folder ${err}`)
    }
  }
  const runScript = async()=>{
    setWaiting(true)
    setError("")
    const sep = separated.toString()
    try {
      const result = await window.electronAPI.runScript(folder1, folder2, language, build, sep);
      if (result) {
        setWaiting(false)
      }
      setData(result); // assuming Python returns {"data": ...}
      
    } catch (err) {
      setWaiting(false)
      setError(String(err));
      console.log(err)
    }
  }
  return (
    <>
    <div id="home">
    {showResults?
    <Results data={data ?? []} setShowResults={setShowResults}/>
    :
    <div>
     <GMASCII/>  {/* Was bothering my eyes so made a separate component */}
      <div id="mainButtons">
        <div className='buttonAndLink'>
          <button onClick={()=>{
            openFolder("folder1")} } className='selectButton'>Select Submissions Folder</button>
            <div className="inLine">
              {folder1 && folder1.length > 0 && 
              <>
              <p>{folder1}</p>
              <button className="deleteBtn" onClick={()=>{
                setFolder1(undefined)}}>X</button>
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
     
        <select value={language} onChange={e=>setLanguage(e.target.value)}>
          <option value="Java">Java</option>
          <option value="Python">Python</option>
          <option value="C++">C++</option>
        </select>
      {
        language === "Java"&&(
          <select value={build} onChange={e=>setBuild(e.target.value)}>
            <option value="gradle">gradle</option>
            <option value="mvn">maven</option>
          </select>
        )
      }
      <br></br>
      <div className='inLine'><input type="checkbox" checked={separated} onChange={()=>setSeparated(!separated)}></input><p title="Check this if your student\'s files are already sorted in names directories like JaneDoe/Project.java">Submission Folder Separated</p></div>
      {
            !folder1 || !folder2  ?
              <div>
                
                <button disabled>Grade</button>
              </div>
              :
              <button onClick={runScript}>Grade</button>
      }
      {
        !waiting && data&&
        <>
        <button id="resButton" onClick={()=>setShowResults(true)}>Show Results</button>
         <button title="Download a folder containing submissions sorted by student name" onClick={saveSortedSubmissions}>Download Sorted</button> 
        </>
      }
      {
        waiting&&
        <img width="200" src={spinner}></img>
      }
      {error&&
      <p>
        Error: {error}
      </p>
      }
      </div>
  }
    </div>
    </>
  )
}

export default Home