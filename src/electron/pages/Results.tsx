import  { useEffect, useState } from "react"
import { type Dispatch, type SetStateAction } from "react"
import duck from '../../assets/duck.gif'

const Results = ({data, setShowResults}:{data:Results[], setShowResults:Dispatch<SetStateAction<boolean>>}) =>{
    
    const [showAnalysis, setShowAnalysis] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)
    const [path, setPath] = useState<string>("");
    const [rubric, setRubric] = useState<string>("");
    const [error, setError] = useState<string | undefined> ()
    const [analysis, setAnalysis] = useState<string>()
    const getAnalysis = async() =>{
        setLoading(true)
        try{
            console.log(path)
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
    useEffect(()=>{
        setAnalysis("")
    }, [path])
    console.log(data)
    return (
        <div id="resultsPage">
            <div id="scores">
            <button onClick={()=>setShowResults(false)}>{`<-- Go back`}</button>

            {
                data && data.map((result:Results)=>(
                    <div className={result.file_path === path? "studentSelected":"student"}>
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
                            setPath(result.file_path)}
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
                    <div id="ollamaPrompt">
                        
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
            }
        </div>
    )
}

export default Results