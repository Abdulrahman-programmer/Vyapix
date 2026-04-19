//Components / Intro.jsx
import "./components.css"
import logo from "../assets/logo.png";
import SignUp from "../components/Signup";
import { use, useState } from "react";


function Intro(params) {


    return (
        <div>
            <img src={logo} alt="Logo" className="h-80 m-auto" />
            <div className="Intro-text">
                <h1 className="text-5xl font-bold mb-6">Welcome to Vyapix</h1>
                <p className="text-lg mb-6 px-4">Your ultimate inventory management solution.
                    Streamline your stock tracking, optimize operations,
                    and boost productivity with Vyapix.</p>
                <button className="btn" onClick={params.openSignup} >Get Started</button>
            </div>        
        </div>
    );
}
export default Intro;


