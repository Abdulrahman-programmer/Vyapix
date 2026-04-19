//Pages / Report.jsx
import React, { useState } from "react";
import axios from "axios";
import { div } from "framer-motion/client";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // set base URL for all axios requests from env variable

export default function ReportPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dailyProfitDate, setDailyProfitDate] = useState("");

    const config = () => {
        const token = localStorage.getItem("authToken");
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    const formatStart = (d) => `${d}T00:00:00`;
    const formatEnd = (d) => `${d}T23:59:59`;

    const callAPI = async (url) => {
        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const res = await axios.get(url, config());
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    // API calls
    const getMostSellingProducts = () => {
        if (!startDate || !endDate) return alert("Select start and end date");
        callAPI(
            `/api/reports/most-selling-products?startDate=${formatStart(
                startDate
            )}&endDate=${formatEnd(endDate)}`
        );
    };
    const getExpiredProducts = () => callAPI("/api/reports/expired-products");
    const getStockValue = () => callAPI("/api/reports/stock-value");
    const getDailyProfit = () => {
        if (!dailyProfitDate) return alert("Select a date");
        callAPI(`/api/reports/profit/daily/${dailyProfitDate}`);
    };
    const getProfitRange = () => {
        if (!startDate || !endDate) return alert("Select start and end date");
        callAPI(
            `/api/reports/profit/date-range?startDate=${formatStart(
                startDate
            )}&endDate=${formatEnd(endDate)}`
        );
    };
    const getSalesSummary = () => callAPI("/api/reports/sales-summary");

    // Table renderer (supports arrays & objects)
const renderTable = (data) => {
    // Always convert single object → array
    const rows = Array.isArray(data.data) ? data.data : [data.data];

    if (!rows || rows.length === 0) {
        return <p className="text-center p-4">No data available</p>;
    }

    // Auto-generate header names
    const headers = Object.keys(rows[0]);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
                <thead>
                    <tr>
                        {headers.map((key) => (
                            <th
                                key={key}
                                className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider"
                            >
                                {key}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((item, index) => (
                        <tr
                            key={index}
                            className={
                                index % 2 === 0
                                    ? "bg-gray-100 dark:bg-gray-700"
                                    : "bg-white dark:bg-gray-800"
                            }
                        >
                            {headers.map((header, i) => {
                                const value = item[header];

                                // Format numeric values with ₹ symbol and commas
                                const formattedValue =
                                    typeof value === "number"
                                        ? `₹${new Intl.NumberFormat("en-IN").format(value)}`
                                        : value !== null && value !== undefined
                                        ? value.toString()
                                        : "N/A";

                                return (
                                    <td
                                        key={i}
                                        className="px-6 py-4 border-b border-gray-300"
                                    >
                                        {formattedValue}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};





    return (
        <div className="p-6  mx-auto lg:ml-72">
            <h1 className="text-4xl font-bold mb-6 text-center bg-white p-2 rounded-2xl dark:bg-gray-700 transition duration-300">Reports</h1>

            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg shadow dark:bg-gray-800 transition duration-300">
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
                <button
                    className="bg-blue-500 text-white p-3 rounded shadow hover:bg-blue-600 transition"
                    onClick={getMostSellingProducts}
                >
                    Most Selling Products
                </button>
                <button
                    className="bg-blue-500 text-white p-3 rounded shadow hover:bg-blue-600 transition"
                    onClick={getExpiredProducts}
                >
                    Expired Products
                </button>
                <button
                    className="bg-blue-500 text-white p-3 rounded shadow hover:bg-blue-600 transition"
                    onClick={getStockValue}
                >
                    Stock Value
                </button>
                <button
                    className="bg-blue-500 text-white p-3 rounded shadow hover:bg-blue-600 transition"
                    onClick={getDailyProfit}
                >
                    Daily Profit
                </button>
                <button
                    className="bg-blue-500 text-white p-3 rounded shadow hover:bg-blue-600 transition"
                    onClick={getProfitRange}
                >
                    Profit (Range)
                </button>
                <button
                    className="bg-blue-500 text-white p-3 rounded shadow hover:bg-blue-600 transition"
                    onClick={getSalesSummary}
                >
                    Sales Summary
                </button>
            </div>

            {/* Table Output */}
            <div className="mt-6">
                {loading && (
                    <p className="text-blue-500 text-lg font-medium text-center">
                        Loading...
                    </p>
                )}
                {error && (
                    <p className="text-red-500 bg-red-100 p-4 rounded text-center">
                        {error}
                    </p>
                )}
                {result && renderTable(result)}
            </div>
        </div>
    );
}
