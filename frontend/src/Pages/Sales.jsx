// Pages/Sales.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import MakeSale from "../components/MakeSale";
import { deleteSale } from "../utills/deleteSale";
import { fetchSales } from "../utills/fetchSales";
import { fetchSalesbyDate } from "../utills/fetchSalesbyDate";
import { fetchSalebyRange } from "../utills/fetchSalesbyRange";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

// ─── helpers ────────────────────────────────────────────────────────────────

const authConfig = () => {
    const token = localStorage.getItem("authToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const toArray = (value) => (Array.isArray(value) ? value : []);

// ─── component ──────────────────────────────────────────────────────────────

function Sales() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filterType, setFilterType] = useState("all");
    const [singleDate, setSingleDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // ── fetch all sales ────────────────────────────────────────────────────

    const authConfig = () => {
        const token = localStorage.getItem("authToken");
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };
    const refreshSales = useCallback(() => {
        fetchSales(axios, setLoading, setError, setSales, authConfig());
    }, []);
    useEffect(() => { fetchSales(axios, setLoading, setError, setSales, authConfig()); }, [fetchSales]);

    // ── delete ─────────────────────────────────────────────────────────────

    const deleteSale = async (saleId) => {
        if (!window.confirm("Are you sure you want to delete this sale?")) return;
        try {
            await deleteSale(axios, saleId, authConfig())
            .then(() => alert("Sale deleted successfully"))
            .then(() => fetchSales(axios, setLoading, setError, setSales, authConfig()));
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Failed to delete sale");
        }
    };

    // ── filter ─────────────────────────────────────────────────────────────

    const applyFilter = async () => {
        if (filterType === "all" || (!singleDate && !startDate && !endDate)) {
            fetchSales(axios, setLoading, setError, setSales, authConfig());
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let res;

            if (filterType === "single") {
                fetchSalesbyDate(axios, singleDate, setLoading, setError, setSales, authConfig());
            } else if (filterType === "range") {
                fetchSalebyRange(axios, startDate, endDate, setLoading, setError, setSales, authConfig());
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to fetch filtered sales");
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilterType("all");
        setSingleDate("");
        setStartDate("");
        setEndDate("");
        setDisplayedSales(sales);
    };

    // ── derived ────────────────────────────────────────────────────────────

    const totalAmount = sales
        .reduce((sum, s) => sum + (s.totalPrice ?? 0), 0)
        .toFixed(2);

    // ── render ─────────────────────────────────────────────────────────────

    return (
        <div className="p-4 lg:ml-72">

            {/* header */}
            <div className="relative mb-4 bg-white dark:bg-gray-700 p-2 rounded-lg flex items-center">
                <h1 className="absolute left-1/2 -translate-x-1/2 text-3xl font-bold">
                    Sales Page
                </h1>
                <div className="ml-auto">
                    <MakeSale refreshSales={refreshSales} />
                </div>
            </div>

            {loading && <Loading text="Loading sales..." />}

            {error && (
                <div className="mt-4 text-red-600 text-center" role="alert">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* filter bar */}
                    <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg">

                        {/* radio buttons */}
                        <div className="flex items-center gap-4 mb-2">
                            {["all", "single", "range"].map((type) => (
                                <label key={type} className="flex items-center gap-2 capitalize">
                                    <input
                                        type="radio"
                                        value={type}
                                        checked={filterType === type}
                                        onChange={() => setFilterType(type)}
                                    />
                                    <span>{type === "single" ? "Single Date" : type === "range" ? "Date Range" : "All"}</span>
                                </label>
                            ))}
                        </div>

                        {/* date inputs + actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            {filterType === "single" && (
                                <label className="flex items-center gap-2">
                                    <span className="text-sm">Date:</span>
                                    <input
                                        type="date"
                                        value={singleDate}
                                        onChange={(e) => setSingleDate(e.target.value)}
                                        className="p-1 rounded"
                                    />
                                </label>
                            )}

                            {filterType === "range" && (
                                <>
                                    <label className="flex items-center gap-2">
                                        <span className="text-sm">Start:</span>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="p-1 rounded"
                                        />
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <span className="text-sm">End:</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="p-1 rounded"
                                        />
                                    </label>
                                </>
                            )}

                            <div className="ml-2">
                                <button
                                    onClick={applyFilter}
                                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="bg-gray-300 text-black px-3 py-1 rounded"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* table or empty state */}
                    {sales.length === 0 ? (
                        <div className="mt-6 text-center text-gray-500">No sales found.</div>
                    ) : (
                        <div className="overflow-x-auto mt-6 bg-white dark:bg-gray-700 p-3 rounded-lg">
                            <table className="table-auto w-full mt-6 border-collapse border border-black dark:border-gray-300">

                                <thead className="bg-gray-200 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2">Serial No.</th>
                                        <th className="px-4 py-2 hidden md:table-cell">Date/Time</th>
                                        <th className="px-4 py-2 hidden md:table-cell">Barcode</th>
                                        <th className="px-4 py-2">Product Name</th>
                                        <th className="px-4 py-2">Quantity</th>
                                        <th className="px-4 py-2 md:table-cell">Selling Price</th>
                                        <th className="px-4 py-2">Total</th>
                                        <th className="px-4 py-2">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sales.map((sale, index) => (
                                        <tr
                                            key={sale._id}
                                            className="border border-black dark:border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            <td className="px-4 py-2 text-center">{index + 1}</td>
                                            <td className="px-4 py-2 hidden text-center md:table-cell">
                                                {new Date(sale.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2 hidden md:table-cell">
                                                {sale.productId?.barcode ?? "N/A"}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {sale.productId?.name ?? "N/A"}
                                            </td>
                                            <td className="px-4 py-2 text-center">{sale.quantity}</td>
                                            <td className="px-4 py-2 md:table-cell">
                                                ₹{sale.productId?.sellingPrice?.toFixed(2) ?? "N/A"}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <strong>₹{sale.totalPrice?.toFixed(2) ?? "N/A"}</strong>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    className="bg-red-500/80 p-3 rounded-lg"
                                                    onClick={() => deleteSale(sale._id)}
                                                    aria-label="Delete sale"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                                {/* totals footer — use tfoot, not a second thead */}
                                <tfoot className="bg-gray-200 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left" colSpan={6}>
                                            Total Sales Amount:
                                        </th>
                                        <th className="px-4 py-2">₹{totalAmount}</th>
                                        <th />
                                    </tr>
                                </tfoot>

                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Sales;