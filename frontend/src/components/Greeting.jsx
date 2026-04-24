//Components / Greeting.jsx
import { useState,useEffect } from "react";
function Greeting(params) {
    const [displayedText, setDisplayedText] = useState('');
    const fullText = `Welcome Back, ${sessionStorage.getItem("name") || 'Admin'}`;

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(fullText.slice(0, i + 1));
            i++;
            if (i === fullText.length) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="greeting p-5 lg:p-10 lg:ml-72 bg-white rounded-lg shadow-md mt-2.5 mx-4 dark:bg-gray-800 dark:text-white">
            <h1 className="text-2xl text-center lg:text-4xl font-bold">
                {displayedText}
                <span className="animate-pulse">|</span>
            </h1>
            <p className="text-sm text-center lg:text-base text-gray-500 mt-1">
                Here's what's happening with your store today.
            </p>
        </div>
    );
}
export default Greeting;