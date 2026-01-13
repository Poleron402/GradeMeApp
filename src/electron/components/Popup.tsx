import { X } from "lucide-react"
import { type Dispatch, type SetStateAction } from "react"

interface ErrorPopupProps {
    setError: Dispatch<SetStateAction<string|undefined>>,
    errorText: string,
}
export const ErrorPopup = ({setError, errorText}:ErrorPopupProps) =>{
    console.log("Here")
    return (
            <div className="popups">
                <div className="popupInfo">
                    <h3>An error occured while running application</h3>
                    <button className="popupClose" onClick={()=>setError(undefined)}><X/></button>
                    <span>==================================================</span>
                    <pre id="separatedpopup">{errorText}
                    </pre>
                </div>
            </div>
        )
}