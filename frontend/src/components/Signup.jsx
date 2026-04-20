import { useState } from "react";
import { useNavigate } from "react-router-dom";
import closeIcon from "../assets/close.svg";
import "./components.css";
import axios from "axios";
import Loading from "./Loading";
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;


function SignUp(params) {
    const [loading, setLoading] = useState(false);
    const [visibility, setVisiblity] = useState("password")
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault();
        try {
            
            const form = new FormData(e.target);
            const payload = Object.fromEntries(form.entries());
            
            

            // adjust URL to your signup endpoint
            const response = await axios.post("api/auth/register", payload);


            if (response.status >= 200 && response.status < 300) {
                // close modal if provided
                params.close?.();

                // navigate to afterlogin page and pass name/email in state
                sessionStorage.setItem("userName",payload.username);
                sessionStorage.setItem("userEmail",payload.email);
                const res = await axios.post("api/auth/login", { email: payload.email, password: payload.password });
                localStorage.setItem("authToken", res.data.token);
                navigate("/afterlogin", { state: { name: payload?.username || "", email: payload?.email || "" } });
            } else {
                alert("Signup failed. Please try again.");
            }
        } catch (err) {
            alert(err?.response?.data?.message || "An error occurred during signup.");
        }finally{
                setLoading(false);
        }
    };

    return (
        <div className="box top-15">
            {loading && <Loading text="Signing up..." />}
            <div className=" flex justify-end" >
                <img src={closeIcon} className="opacity-70 cursor-pointer"
                alt="close" onClick={() => { params.close() }} />
            </div>
            <h1 className="text-5xl pt-10 label text-center">Sign up</h1>

            <form onSubmit={handleSubmit} className="flex flex-col p-10 pb-0 pt-5">

                <label htmlFor="gst" className="label">GST no.</label>
                <input type="text" name="gstNo" id="gstNo" required className="ip" />

                <label htmlFor="Name" className="label">Name</label>
                <input type="text" name="name" id="name" required className="ip" />

                <label htmlFor="email" className="label">Email</label>
                <input type="email" name="email" id="email" required className="ip" />

                <label htmlFor="password" className="label">password</label>
                <input type={visibility} name="password" id="password" required className="ip" />
                <div >
                    <input
                        type="checkbox"
                        onChange={(e) => setVisiblity(e.target.checked ? "text" : "password")}
                        className="mr-1.5"
                    />  <p className="inline label ">show password</p>
                </div>

                <input type="submit" value="Sign up" className="btn mt-5 mb-0" />
            </form>
            <p className="text-center mt-5 mb-10 label">
                Already have an account?
                <button
                    className="text-blue-500 pl-1 hover:underline dark:text-blue-700"
                    onClick={params.openLogin}
                >
                    Login
                </button>
            </p>
        </div>
    )
}

export default SignUp;
