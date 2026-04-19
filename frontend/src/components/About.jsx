//Components / About.jsx
import React from "react";  
import "./components.css";
import logo from '../assets/logo.png';

function About(params) {
    return (
        <div className="">
            <div className="p-10">
                <img src={logo} alt="Vyapix Logo" className="h-80 m-auto" />
                <h2 className="text-2xl font-bold text-center mb-5">About Vyapix</h2>

                <p className="mb-5">Vyapix is a cutting-edge platform designed to revolutionize the way businesses manage their operations. Our mission is to provide innovative solutions that streamline processes, enhance productivity, and drive growth.</p>

                <p className="mb-5">With a user-friendly interface and powerful features, Vyapix empowers businesses to take control of their workflows and achieve their goals efficiently.</p>

                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 " onClick={params.close}>Close</button>
            </div>
        </div>
    );
}

export default About;