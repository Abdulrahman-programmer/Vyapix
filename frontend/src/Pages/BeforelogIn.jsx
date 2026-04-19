//Pages / BeforelogIn.js
import React, { useState } from "react";
import Header from "../components/Header";
import Intro from "../components/Intro";
import Login from "../components/Login";
import SignUp from "../components/Signup";
import About from "../components/About";


function Before_logIn() {
    const [loginOrSignUp, setLoginOrSignUp] = useState(null);
    const islogin = (loginOrSignUp === "login");
    const isSignup = (loginOrSignUp === "signup");
    const [aboutopen, setAboutopen] = useState(false);
    return (
        <div>
           <Header islogin = {false} 
           openLogin = {() => setLoginOrSignUp('login')}
           openSignup ={() => setLoginOrSignUp('signup')}
           openAbout = {() => setAboutopen(true)}
           />
           {aboutopen && <About close = {() => setAboutopen(false)}/>}
            {!aboutopen && <Intro openSignup ={() => setLoginOrSignUp('signup')}/>}
           {islogin && <Login close = {()=> setLoginOrSignUp(null)} openSignup ={() => setLoginOrSignUp('signup')}/>}
           {isSignup && <SignUp
            close = {() => setLoginOrSignUp(null)}
            openLogin = {() => {setLoginOrSignUp('login')}}/>}
          <div
                className={`fixed inset-0 h-screen bg-black bg-opacity-100 
                    transition-opacity duration-300 z-10 ${loginOrSignUp ? "opacity-50 pointer-events-auto " : "opacity-0 pointer-events-none"} `}
                onClick={() => setLoginOrSignUp(null)}
            />
        </div>
    )
}
export default Before_logIn;