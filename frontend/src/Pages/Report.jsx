// Pages / Report.jsx
import React, { useState } from "react";
import axios from "axios";
import { renderTable } from "../components/TableRenderer";
import { fetchMostSellingProducts } from "../utills/mostSelling";
import { fetchExpiringProducts } from "../utills/expirying";
import { getStockValue } from "../utills/getStockValue";
import { getDailyProfit } from "../utills/getDailyProfit";
import { getProfitRange } from "../utills/getProfitRange";
import { getSalesSummary } from "../utills/getSalesSummary";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

export default function ReportPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [type, setType] = useState(""); // To track which report type is being displayed
 
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dailyProfitDate, setDailyProfitDate] = useState("");

    const config = () => {
        const token = localStorage.getItem("authToken");
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    
    // const callAPI = async (url) => {
    //     try {
    //         setLoading(true);
    //         setError(null);
    //         setResult(null);

    //         const res = await axios.get(url, config());

    //         console.log(res.data.data);
            
            
    //         // ✅ normalize response safely
            
    //         setResult(res.data.data);
    //     } catch (err) {
    //         // ✅ better error handling
    //         const msg =
    //             err.response?.data?.message ||
    //             err.response?.data ||
    //             err.message ||
    //             "Something went wrong";

    //         setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // API calls
    const getMostSellingProducts = () => {
        if (!startDate || !endDate) return alert("Select start and end date");
        fetchMostSellingProducts(axios, startDate, endDate, setResult , setLoading , setError, config())
        .then(() => setType("mostSelling"));
        
    };

    const getExpiringProducts = () =>{
        fetchExpiringProducts(axios, setResult, setLoading, setError, config())
        .then(() => setType("expiring"));
}
    const get_Stock_Value = () =>{
        getStockValue(axios, setResult, setLoading, setError, config())
        .then(() => setType("stockValue"));
    }

    const get_Daily_Profit = () => {
        if (!dailyProfitDate) return alert("Select a date");
        getDailyProfit(axios, dailyProfitDate, setResult, setLoading, setError, config())
        .then(() => setType("dailyProfit")) ;
    };

    const get_Profit_Range = () => {
        if (!startDate || !endDate) return alert("Select start and end date");
        getProfitRange(axios, startDate, endDate, setResult, setLoading, setError, config())
        .then(() => setType("profitRange"));
    };

    const get_Sales_Summary = () =>{
        getSalesSummary(axios,startDate, endDate,setResult, setLoading, setError, config())
        .then(() => setType("salesSummary"));
    }
    
   
    return (
        <div className="p-6 mx-auto lg:ml-72">
            <h1 className="text-4xl font-bold mb-6 text-center bg-white p-2 rounded-2xl dark:bg-gray-700">
                Reports
            </h1>

            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg shadow dark:bg-gray-800">
                <div className="flex items-center">
                    <label className="mr-2 font-medium">Start Date:</label>
                    <input
                        type="date"
                        className="border p-2 rounded w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="flex items-center">
                    <label className="mr-2 font-medium">End Date:</label>
                    <input
                        type="date"
                        className="border p-2 rounded w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="flex items-center md:col-span-2">
                    <label className="mr-2 font-medium">Daily Profit Date:</label>
                    <input
                        type="date"
                        className="border p-2 rounded w-full"
                        value={dailyProfitDate}
                        onChange={(e) => setDailyProfitDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <button className="btn" onClick={getMostSellingProducts}>
                    Most Selling Products
                </button>
                <button className="btn" onClick={getExpiringProducts}>
                    Expiring Products
                </button>
                <button className="btn" onClick={get_Stock_Value}>
                    Stock Value
                </button>
                <button className="btn" onClick={get_Daily_Profit}>
                    Daily Profit
                </button>
                <button className="btn" onClick={get_Profit_Range}>
                    Profit (Range)
                </button>
                <button className="btn" onClick={get_Sales_Summary}>
                    Sales Summary
                </button>
            </div>

            {/* Output */}
            <div className="mt-6">
                {loading && (
                    <p className="text-blue-500 text-center">Loading...</p>
                )}
                {error && (
                    <p className="text-red-500 bg-red-100 p-4 rounded text-center">
                        {error}
                    </p>
                )}
                {result && renderTable(result , type)}
            </div>
        </div>
    );
}