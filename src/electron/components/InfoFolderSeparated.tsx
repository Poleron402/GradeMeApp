import { X } from "lucide-react"
import { type Dispatch, type SetStateAction } from "react"

export const InfoFolderSeparatedPopUp = ({setPopupOn}:{setPopupOn:Dispatch<SetStateAction<boolean>>}) => {
    return (
        <div className="popups">
            <div className="popupInfo">
                <h3>A separated folder <br></br>must have the following structure</h3>
                <button className="popupClose" onClick={()=>setPopupOn(false)}><X/></button>
                <span>==================================================</span>
                <pre id="separatedpopup">submissions/                     <br></br>
├── Jane Doe (<u>must</u> be a student name)/<br></br>
│   └── submission_file.py        <br></br>
├── John Doe/                     <br></br>
│   └── submission_file.py        <br></br>
├── Pol Mejia/                    <br></br>
│   └── submission_file.py        <br></br>
└── Test Student/                 <br></br>
└── submission_file.py   <br></br>
                </pre>

            </div>
        </div>
    )
}