import  { useEffect, useState } from "react"
import { type Dispatch, type SetStateAction } from "react"
import { Sparkles } from "lucide-react"
import duck from '../../assets/duck.gif'
import StudentCode from "../components/StudentCode"
import ReactMarkdown from 'react-markdown' 


const Results = ({data, setShowResults}:{data:Results[], setShowResults:Dispatch<SetStateAction<boolean>>}) =>{
    
    const [showAnalysis, setShowAnalysis] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)
    const [path, setPath] = useState<string>("");
    const [currentCode, setCurrentCode] = useState<string|undefined>(undefined)
    const [rubric, setRubric] = useState<string>("");
    const [error, setError] = useState<string | undefined> ()
    const [analysis, setAnalysis] = useState<string>()
    const [name, setName] = useState<string>()

    // const [selectedText, setSelectedText] = useState<string|undefined>();

    const getAnalysis = async() =>{
        setLoading(true)
        try{
            if (path.length === 0){
                setError("There was an issue finding path.")
                setLoading(false)
            }else{
                const result = await window.electronAPI.runOllama(path, rubric);
                if (result){
                    setLoading(false)
                    setAnalysis(result)
                }
                
            }
        }catch (err) {
            setLoading(false)
            setError(String(err));
        }
    }
    const getCode = async(filePath: string)=>{
        const fileContent = await window.electronAPI.getFileContent(filePath)
        setCurrentCode(fileContent)
    }
    useEffect(()=>{
        setAnalysis("")

    }, [path])
    console.log(data)
    return (
        <div id="resultsPage">
            <div id="scores">
            <button className="normalButton" onClick={()=>setShowResults(false)}>{`<-- Go back`}</button>

            {
                data && data.map((result:Results)=>(
                    <div key={result.name} className={result.name === name? "studentSelected":"student"}>
                    <h3>Name: {result.name}</h3>
                    <h4>Test Score: {result.result}</h4>
                    {
                        result.file_path.map((sfile:string)=>{
                            const sfile_array = sfile.split("/")
                            return(
                                <>
                            <button className="normalButton" onClick={()=>{
                            setShowAnalysis(sfile)
                            setPath(sfile)
                            setName(result.name)
                            getCode(sfile)}
                        }>
                                {sfile_array[sfile_array.length-1]}
                            </button>
                            <br></br></>)
                    }   )
                    }
                    {
                        showAnalysis && showAnalysis !="" &&
                        <>
                        <button className="normalButton" onClick={()=>{
                            
                            setShowAnalysis("")
                            setPath("")
                            setName("")}}>Hide analysis</button>
                        </>
                    }
                    </div>
                ))
            }
      
            </div>
            {
                error&&<p>{error}</p>
            }
            {
                showAnalysis && showAnalysis.length > 0 &&
                <>
                    <div id="ollamaPrompt">
                        <p><Sparkles/>AI chat</p>
                        <h3>Any rubric requirements?</h3> <br></br>
                        <textarea value={rubric} 
                        onChange={e=>setRubric(e.target.value)}></textarea>
                        <button className="normalButton" onClick={getAnalysis}>{rubric.length> 0? "Get Analysis" : "Send Without"}</button>
                        {loading?
                            <img id="duck" src={duck}></img>
                            :
                            <div id="resultMarkdown">
                                <ReactMarkdown >{analysis}</ReactMarkdown>
                            </div>
                        }
                    </div>
                    <StudentCode currentCode={currentCode}/>
                </>
            }

        </div>
    )
}

export default Results