import { useState } from "react";
import { RubricASCII } from "../components/GMASCII"
import goose from '../../assets/goose.gif'
import { ErrorPopup } from "../components/Popup";

const Rubric = () =>{
    const [points, setPoints] = useState<string>("0");
    const [about, setAbout] = useState<string>("");
    const [important, setImportant] = useState<string>("");
    const [unimportant, setUnimportant] = useState<string>("");
    const [waiting, setWaiting] = useState<boolean>(false);
    const [rubric, setRubric] = useState<string>("");
    const [err, setErr] = useState<string|undefined>()
// This is a web development project where the student is tasked with building a static website for a business of their choice.
// Most important aspect of the assignment is the routing of pages. Also important are error handling, having all buttons have a purpose.
// Least important aspect is responsiveness to mobile view.
    const getRubric = async()=>{
        let tableHTML:string = ""
        try {
            tableHTML = await window.electronAPI.getRubric(points, about, important, unimportant)
            console.log(tableHTML)
            setRubric(tableHTML)
        }catch (err) {
            console.error(err);
            setErr("There has been an error calling analyzing function");
        }finally {
            setWaiting(false); 
        }

    }
    return(
        <div id="rubricPage">
            <div id="rubric">
                <RubricASCII/>
                <h4>Optimize and create fair grading rubric for students by answering<br></br> the folowing questions:</h4>
                <div id="questionnaire">
                    <table>
                        <tr>
                            <td>
                                <label htmlFor="numberOfPoints">Out of how many points will the assignment be graded?</label>
                            </td>
                            <td>
                                <input onChange={(e)=>setPoints(e.target.value)} id="numberOfPoints" value={points} type="number"></input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="about">Describe what the assignment is about: </label>
                            </td>
                            <td>
                                <textarea placeholder="This is a game development project aimed at developing an endless runner game." onChange={(e)=>setAbout(e.target.value)} value={about} id="about" className="questionnaire"></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="important">What is the MOST important aspect in the assignment that you are looking for?</label>
                            </td>
                            <td>
                                <textarea placeholder="The most important aspect of the assignment is the absence of bugs and smooth gameplay." onChange={(e)=>setImportant(e.target.value)} value = {important} id="important" className="questionnaire"></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="unimportant">What is the LEAST important aspect in the assignment that you are looking for?</label>
                            </td>
                            <td>
                                <textarea placeholder="The least important aspect of the assignment is the presense of sound effects." onChange={(e)=>setUnimportant(e.target.value)} value = {unimportant} id="unimportant" className="questionnaire"></textarea>
                            </td>
                        </tr>
                    </table>
                    <br></br>
                    <button className="normalButton" onClick={()=>{
                        setWaiting(true)
                        getRubric()
                    }}>Suggect a Rubric</button>
                    <br></br><br></br>
                </div>

            </div>
            <div id="rubricResult">
                {
                    err && <ErrorPopup errorText={err} setError={setErr}/>
                }
                {
                    waiting&&<img id="duck" src={goose}></img>
                }
                {
                    rubric.length>0 && !waiting && (
                        <div id="table" dangerouslySetInnerHTML={{ __html: rubric }} />
                    )
                }
            </div>
        </div>
    )
}

export default Rubric