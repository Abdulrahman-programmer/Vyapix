import "./components.css";
import { useState } from "react";
import closeIcon from "../assets/close.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
function Login(params) {
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState("password");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL ;
  axios.defaults.baseURL = API;

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    

    try {
  
      const res = await axios.post("api/auth/login", { email, password });

      // save token if provided
      if (res.data?.token) {
        localStorage.setItem("authToken", res.data.token);
      }

  // optional: close modal then navigate
  params.close?.();
  // Build name/email to pass to afterlogin. Prefer server response, fall back to submitted email.
  const name = res.data?.user?.username ;
  const userEmail = res.data?.user?.email;
  sessionStorage.setItem("userName", name || "");
  sessionStorage.setItem("userEmail", userEmail || email);
  
  navigate("/afterlogin");
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || err.message || "Login failed";
      alert(msg);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="box">
      {loading && <Loading text="Logging in..." />}
      {/* Close button */}
      <div className="flex justify-end">
        <img
          src={closeIcon}
          alt="close"
          className="opacity-70 cursor-pointer"
          onClick={() => params.close()}
        />
      </div>

      <h1 className="text-5xl pt-10 text-gray-700 text-center dark:text-gray-200">Login</h1>

      <form onSubmit={handleSubmit} method="post" className="flex flex-col p-10 pb-5">
        {/* Email */}
        <label htmlFor="email" className="label">Email</label>
        <input type="email" name="email" id="email" required className="ip" />

        {/* Password */}
        <label htmlFor="password" className="label">Password</label>
        <input
          type={visibility}
          name="password"
          id="password"
          required
          className="ip"
          autoComplete="on"
        />

        {/* Show password toggle */}
        <label className="flex items-center mt-2 label cursor-pointer">
          <input
            type="checkbox"
            onChange={(e) => setVisibility(e.target.checked ? "text" : "password")}
            className="mr-1.5"
          />
          Show password
        </label>

        {/* Submit */}
        <input type="submit" value="Login" className="btn mt-10" />
      </form>

      {/* Register link */}
      <p className="pb-10 text-center text-gray-700 dark:text-gray-300">
        Don't have an account?
        <button
          className="text-blue-500 pl-1 hover:underline dark:text-blue-700"
          onClick={params.openSignup}
        >
          Register
        </button>
      </p>
    </div>
  );
}

export default Login;
