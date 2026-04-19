//Pages / LowStock.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // set base URL for all axios requests from env variable

const normalizeItem = (it) => {
    const id = it.id ?? it.productId ?? it._id ?? it.product_id ?? null;
    const barcode = it.barcode ?? it.bracode ?? it.barCode ?? '';
    const qty = Number(it.qty ?? it.quantity ?? 0);
    const costPrice = Number(it.costPrice ?? it.cost ?? 0);
    const sellingPrice = Number(it.sellingPrice ?? it.selling ?? 0);
    return {
        ...it,
        id,
        barcode,
        name: (it.name ?? '').toString().toUpperCase(),
        category: (it.category ?? '').toString().toUpperCase(),
        qty,
        costPrice,
        sellingPrice,
    };
};

function Low_Stock() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // `appliedThreshold` controls the displayed filter; `pendingThreshold` is the UI selection
    const [appliedThreshold, setAppliedThreshold] = useState(10);
    const [pendingThreshold, setPendingThreshold] = useState(10);
    // when true the select shows "Custom..." and the numeric input remains visible
    const [pendingIsCustom, setPendingIsCustom] = useState(false);
    // store custom input as string so it can start empty and accept multi-digit typing
    const [pendingCustom, setPendingCustom] = useState('');
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('token') || localStorage.getItem('authToken') || '');

    useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [authToken]);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'token' || e.key === 'authToken') {
                setAuthToken(e.newValue || '');
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // fetch low-stock products for the given threshold (extracted so Apply can call it)
    const fetchLowStock = async (th) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/api/products/low-stock/${th}`);
            const payload = res.data && (res.data.data ?? res.data);
            if (Array.isArray(payload)) {
                setItems(payload.map(normalizeItem));
            } else {
                setItems([]);
            }
        } catch (err) {
            // include more details to help debugging
            const msg = err?.response ? `${err.response.status} ${err.response.statusText}` : (err.message || 'Unknown error');
            setError(`Could not fetch low-stock items from server: ${msg}`);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // fetch on mount and whenever appliedThreshold changes
    useEffect(() => {
        fetchLowStock(appliedThreshold);
    }, [appliedThreshold]);

    const thresholdOptions = [1, 2, 5, 10, 20, 50, 100];

    // items are already server-filtered by appliedThreshold
    const filtered = items;

    return (
        <div className='w-full'>
            <h1 className="text-3xl max-w-[80%] m-auto font-bold text-center rounded-2xl bg-white mt-4 p-2 transition-all duration-300 dark:bg-gray-700 dark:hover:bg-gray-500 lg:ml-72">Low Stock Page</h1>

            <div className="max-w-[80%] mx-auto mt-6 p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800 lg:ml-72">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Threshold</label>
                        <select
                            value={pendingIsCustom ? 0 : pendingThreshold}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === '0') {
                                    setPendingIsCustom(true);
                                    setPendingCustom('');
                                    // keep pendingThreshold untouched until Apply
                                } else {
                                    setPendingIsCustom(false);
                                    setPendingThreshold(Number(v));
                                }
                            }}
                            className="px-3 py-2 border rounded-md dark:bg-gray-700"
                        >
                            {thresholdOptions.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                            <option value={0}>Custom...</option>
                        </select>
                    </div>

                    {pendingIsCustom ? (
                        <div>
                            <label className="block text-sm font-medium mb-1">Custom Threshold</label>
                            <input
                                type="number"
                                min="0"
                                value={pendingCustom}
                                className="px-3 py-2 border rounded-md dark:bg-gray-700"
                                onChange={(e) => setPendingCustom(e.target.value)}
                                placeholder="Enter number"
                            />
                        </div>
                    ) : null}

                    <div className="flex items-center gap-3 ml-auto">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <div>Showing products with quantity ≤ <strong>{appliedThreshold}</strong></div>
                            <div className="text-xs mt-1">{loading ? 'Loading...' : `${filtered.length} product(s)`}</div>
                            {error ? <div className="text-red-500 text-sm">{error}</div> : null}
                        </div>

                        <button
                            onClick={() => {
                                // compute threshold from pending state (custom vs preset)
                                const th = pendingIsCustom ? Number(pendingCustom || 0) : pendingThreshold;
                                setAppliedThreshold(th);
                                fetchLowStock(th);
                            }}
                            disabled={loading || (pendingIsCustom && pendingCustom.trim() === '')}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Applying...' : 'Apply'}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto mt-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium">#</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Category</th>
                                <th className="px-4 py-2 text-right text-sm font-medium">Quantity</th>
                                <th className="px-4 py-2 text-right text-sm font-medium">Cost</th>
                                <th className="px-4 py-2 text-right text-sm font-medium">Selling</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No low-stock items match the threshold.</td>
                                </tr>
                            ) : (
                                filtered.map((it, idx) => (
                                    <tr key={it.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm">{it.name}</td>
                                        <td className="px-4 py-3 text-sm">{it.category || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-right">{it.qty}</td>
                                        <td className="px-4 py-3 text-sm text-right">₹{Number(it.costPrice).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-right">₹{Number(it.sellingPrice).toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Low_Stock;