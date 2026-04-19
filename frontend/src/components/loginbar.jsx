import React from "react";
import "./components.css";
import DarkModeToggle from "./Btn-toggle";
function Login_btn(params) {
  
    return (
        <ul className="nav-links">
            <DarkModeToggle islogin ={false}/>
            <button className="text-sm md:text-base" onClick={() => {params.openAbout()}}>About</button>
            <button className="btn mt-3 p-1 px-2.5 md:py-3 md:px-5 text-base md:text-xl "
                onClick={params.open} >Login</button>

        </ul>
    );
}
export default Login_btn;