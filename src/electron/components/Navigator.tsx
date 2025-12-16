import { HomeIcon, BookOpenCheck, UserStar } from "lucide-react"
import { Link } from "react-router-dom"
const Navigator = () =>{
    return (
        <div id="navigatorDiv">
            <Link to="" className="link"><HomeIcon id="homeLink" /></Link>
            <div id="navigatorExtras">
                <Link to="/rubric" className="link"><BookOpenCheck id="rubricLink"/></Link>
                <Link to="/userSignup" className="link"><UserStar id="userLink"/></Link>
            </div>
            
        </div>
    )
}

export default Navigator