
import './App.css'
import { HashRouter as Router, Routes, Route } from 'react-router'
import Home from './electron/HomePage';
import Navigator from './electron/components/Navigator';
import Rubric from './electron/pages/Rubric';


function App() {
 return (
    <>
    <Router>
        <Navigator/>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/rubric" element={<Rubric/>}/>
        </Routes>

    </Router>
    </>
 )
}

export default App
