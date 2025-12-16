import  { useEffect, useState } from "react"
import { type Dispatch, type SetStateAction } from "react"
import { Sparkles, FileCodeCorner } from "lucide-react"
import duck from '../../assets/duck.gif'
import ReactCodeMirror from "@uiw/react-codemirror";


const Results = ({data, setShowResults}:{data:Results[], setShowResults:Dispatch<SetStateAction<boolean>>}) =>{
    
    const [showAnalysis, setShowAnalysis] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)
    const [path, setPath] = useState<string>("");
    const [currentCode, setCurrentCode] = useState<string|undefined>(undefined)
    const [rubric, setRubric] = useState<string>("");
    const [error, setError] = useState<string | undefined> ()
    const [analysis, setAnalysis] = useState<string>()
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
    return (
        <div id="resultsPage">
            <div id="scores">
            <button onClick={()=>setShowResults(false)}>{`<-- Go back`}</button>

            {
                data && data.map((result:Results)=>(
                    <div key={result.file_path} className={result.file_path === path? "studentSelected":"student"}>
                    <h3>Name: {result.name}</h3>
                    <h4>Test Score: {result.result}</h4>
                    {
                        showAnalysis === result.file_path?
                        <>
                        <button onClick={()=>{
                            
                            setShowAnalysis("")
                            setPath("")}}>Hide analysis</button>
                        </>
                        :
                        <button onClick={()=>{
                            setShowAnalysis(result.file_path)
                            setPath(result.file_path)
                            getCode(result.file_path)}
                        }>Show AI analysis</button>
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
                        <button onClick={getAnalysis}>{rubric.length> 0? "Get Analysis" : "Send Without"}</button>
                        {loading?
                            <img id="duck" src={duck}></img>
                            :
                            <p>{analysis}</p>
                        }
                    </div>
                    <div id="studentCode">
                        <p><FileCodeCorner/>Student Code</p>
                        <h3>Review and ask</h3> <br></br>
                        <div id="codeMirror">
                        <ReactCodeMirror
                            minWidth="350px"
                            theme="dark"
                            value={currentCode}
                        />
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

export default Results