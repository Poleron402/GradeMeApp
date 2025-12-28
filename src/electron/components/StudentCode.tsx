import { FileCodeCorner } from "lucide-react";
import ReactCodeMirror from "@uiw/react-codemirror";

interface ChildProps {
    currentCode: string|undefined
}

const StudentCode: React.FC<ChildProps> = ({currentCode}) =>{
    return (
        <div id="studentCode">
            <p><FileCodeCorner/>Student Code</p>
            <h3>Review and ask</h3> <br></br>
            <div id="codeMirror">
            <ReactCodeMirror
                minWidth="450px"
                theme="dark"
                value={currentCode}
            />
            </div>
        </div>
    )
}

export default StudentCode