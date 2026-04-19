import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BarcodeScanner from './BarcodeScanner';

// set base URL for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

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

function InventoryManager() {
    // items are loaded from the backend on component mount; do not persist to localStorage
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [qty, setQty] = useState('');
    const [costPrice, setCostPrice] = useState('');
    // read auth token from localStorage and apply to axios for all requests
    const [authToken, setAuthToken] = useState(() => {
        return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
    });

    useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [authToken]);

    // keep authToken in sync if another tab updates localStorage
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'token' || e.key === 'authToken') {
                setAuthToken(e.newValue || '');
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);
    const [sellingPrice, setSellingPrice] = useState('');
    const [barcode, setBarcode] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [scannerOpen, setScannerOpen] = useState(false);


  

    // Fetch from backend on mount
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get('/api/products');
                
                
                // server uses envelope { message, data }
                const payload = res.data && (res.data.data ?? res.data);
                if (Array.isArray(payload)) {
                    setItems(payload.map(normalizeItem));
                }
            } catch (err) {
                // network or server error
                setError('Could not fetch items from server.');
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const resetForm = () => {
        setName('');
        setCategory('');
        setQty('');
        setCostPrice('');
        setSellingPrice('');
        setBarcode('');
        setPurchaseDate('');
        setExpiryDate('');
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const payload = {
            barcode: barcode || (Date.now()).toString(),
            name: name.trim().toUpperCase(),
            category: category.trim().toUpperCase(),
            costPrice: Number(costPrice) || 0,
            sellingPrice: Number(sellingPrice) || 0,
            expiryDate: expiryDate || null,
            purchaseDate: purchaseDate || null,
            quantity: Number(qty) || 0,
            status: 'ACTIVE',
        };
        const save = async () => {
            setError(null);
            try {
                if (editingId) {
                    // update using specific endpoints supported by the API
                    const original = items.find((it) => String(it.id) === String(editingId)) || {};
                    const promises = [];
                    // quantity endpoint
                    if (Number(payload.quantity) !== Number(original.qty)) {
                        promises.push(axios.put(`/api/products/${editingId}/quantity?quantity=${payload.quantity}`));
                    }
                    // price endpoint
                    if (Number(payload.costPrice) !== Number(original.costPrice) || Number(payload.sellingPrice) !== Number(original.sellingPrice)) {
                        promises.push(axios.put(`/api/products/${editingId}/price`, { costPrice: payload.costPrice, sellingPrice: payload.sellingPrice }));
                    }
                    // status endpoint (if provided and different)
                    if (payload.status && payload.status !== original.status) {
                        promises.push(axios.put(`/api/products/${editingId}/status?status=${payload.status}`));
                    }
                    // try full update as a best-effort if other non-price/non-quantity fields changed
                    const otherChanged = ['name', 'category', 'barcode', 'expiryDate', 'purchaseDate'].some((k) => (payload[k] ?? '') !== (original[k] ?? original[k.toLowerCase()] ?? ''));
                    if (otherChanged) {
                        // some backends support this; if it fails we'll ignore and keep local state
                        promises.push(axios.put(`/api/products/${editingId}`, payload).catch(() => null));
                    }

                    const results = await Promise.all(promises);
                    // try to find a server-returned product from responses
                    let updatedRaw = null;
                    for (const r of results) {
                        if (r && r.data) {
                            const p = r.data.data ?? r.data;
                            if (p && (p.id || p.productId || p._id || p.barcode)) {
                                updatedRaw = p;
                                break;
                            }
                        }
                    }
                    const updated = updatedRaw ? normalizeItem(updatedRaw) : normalizeItem({ ...original, ...payload, id: editingId });
                    setItems((prev) => prev.map((it) => (String(it.id) === String(editingId) ? updated : it)));
                } else {
                    const res = await axios.post('/api/products', payload);
                    // support envelope
                    const createdRaw = res.data && (res.data.data ?? res.data);
                    const created = createdRaw ? normalizeItem(createdRaw) : normalizeItem(payload);
                    setItems((prev) => [created, ...prev]);
                }
            } catch (err) {
                // fallback: update in-memory list if backend unavailable
                setError('Could not save to server — item added to the current list.');
                if (editingId) {
                    setItems((prev) => prev.map((it) => (String(it.id) === String(editingId) ? normalizeItem({ ...it, ...payload, id: editingId }) : it)));
                } else {
                    setItems((prev) => [normalizeItem(payload), ...prev]);
                }
            } finally {
                resetForm();
            }
        };
        save();
    };

    const handleEdit = (it) => {
        setName(it.name);
        setCategory(it.category || '');
        setQty(String(it.qty));
        setCostPrice(String(it.costPrice ?? ''));
        setSellingPrice(String(it.sellingPrice ?? ''));
        setBarcode(it.barcode ?? it.bracode ?? '');
        setPurchaseDate(it.purchaseDate ?? '');
        setExpiryDate(it.expiryDate ?? '');
        setEditingId(it.id ?? it.productId ?? it._id ?? it.product_id ?? it.barcode ?? it.bracode ?? null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this item?')) return;
        const remove = async () => {
            setError(null);
                try {
                await axios.delete(`/api/products/${id}`);
                setItems((prev) => prev.filter((it) => String(it.id) !== String(id)));
            } catch (err) {
                // fallback to in-memory delete
                setError('Could not delete on server — removed from current list.');
                setItems((prev) => prev.filter((it) => String(it.id) !== String(id)));
            } finally {
                if (editingId === id) resetForm();
            }
        };
        remove();
    };

    const handleBarcodeScanned = async (scannedBarcode) => {
        console.log('Scanned barcode:', scannedBarcode);
        setBarcode(scannedBarcode);
        
        // Try to find existing product with this barcode
        try {
            const response = await axios.get(`/api/products?barcode=${scannedBarcode}`);
            const products = response.data?.data || response.data || [];
            
            if (products.length > 0) {
                const product = Array.isArray(products) ? products[0] : products;
                const normalizedProduct = normalizeItem(product);
                
                // Ask user what to do with existing product
                const action = window.confirm(
                    `Product found!\n\nName: ${normalizedProduct.name}\nCategory: ${normalizedProduct.category}\nCurrent Quantity: ${normalizedProduct.qty}\nPrice: ₹${normalizedProduct.sellingPrice}\n\nClick OK to edit this product, or Cancel to create a new product with this barcode.`
                );
                
                if (action) {
                    // Edit existing product
                    handleEdit(normalizedProduct);
                } else {
                    // Just set the barcode for new product
                    resetForm();
                    setBarcode(scannedBarcode);
                }
            } else {
                // No product found, create new
                resetForm();
                setBarcode(scannedBarcode);
                // Auto-set today's date for new products
                const today = new Date().toISOString().split('T')[0];
                setPurchaseDate(today);
                // Auto-set expiry date to 1 year from now
                const nextYear = new Date();
                nextYear.setFullYear(nextYear.getFullYear() + 1);
                setExpiryDate(nextYear.toISOString().split('T')[0]);
            }
        } catch (error) {
            console.warn('Error checking existing product:', error);
            // If API call fails, just set the barcode
            setBarcode(scannedBarcode);
            // Auto-set today's date for new products
            const today = new Date().toISOString().split('T')[0];
            setPurchaseDate(today);
            // Auto-set expiry date to 1 year from now
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            setExpiryDate(nextYear.toISOString().split('T')[0]);
        }
        
        setScannerOpen(false);
    };

    return (
        <div className="max-w-[80%] mx-auto mt-6 p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800 lg:ml-72">
            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Barcode</label>
                    <div className="flex gap-2">
                        <input 
                            value={barcode} 
                            onChange={(e) => setBarcode(e.target.value)} 
                            className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700" 
                            placeholder="Enter or scan barcode" 
                        />
                        <button
                            type="button"
                            onClick={() => setScannerOpen(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 text-sm"
                            title="Scan Barcode"
                        >
                            📷
                        </button>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700" placeholder="Item name" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700" placeholder="Category" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input value={qty} onChange={(e) => setQty(e.target.value)} type="number" min="0" className="w-full px-3 py-2 border rounded-md dark:bg-gray-700" placeholder="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Cost Price</label>
                    <input value={costPrice} onChange={(e) => setCostPrice(e.target.value)} type="number" step="0.01" min="0" className="w-full px-3 py-2 border rounded-md dark:bg-gray-700" placeholder="0.00" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Selling Price</label>
                    <input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} type="number" step="0.01" min="0" className="w-full px-3 py-2 border rounded-md dark:bg-gray-700" placeholder="0.00" />
                </div>


                <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1">Purchase Date</label>
                    <input value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} type="date" className="w-full px-3 py-2 border rounded-md dark:bg-gray-700" />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} type="date" className="w-full px-3 py-2 border rounded-md dark:bg-gray-700" />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
                        {editingId ? 'Update' : 'Add'}
                    </button>
                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500">
                        Clear
                    </button>
                </div>
            </form>

            <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">#</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Barcode</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Category</th>
                            <th className="px-4 py-2 text-right text-sm font-medium">Quantity</th>
                            <th className="px-4 py-2 text-right text-sm font-medium">Cost</th>
                            <th className="px-4 py-2 text-right text-sm font-medium">Selling</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Purchase Date</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Expiry Date</th>
                            <th className="px-4 py-2 text-center text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="px-4 py-6 text-center text-gray-500">
                                    No items yet.
                                </td>
                            </tr>
                        ) : (
                            items.map((it, idx) => (
                                <tr key={it.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                    <td className="px-4 py-3 text-sm font-mono">{it.barcode || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{it.name}</td>
                                    <td className="px-4 py-3 text-sm">{it.category || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-right">{it.qty}</td>
                                    <td className="px-4 py-3 text-sm text-right">₹{Number(it.costPrice).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-right">₹{Number(it.sellingPrice).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm">{it.purchaseDate || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{it.expiryDate || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center space-x-2">
                                        <button onClick={() => handleEdit(it)} className="px-2 py-1 bg-yellow-400 rounded-md hover:bg-yellow-300">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(it.id)} className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-400">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {items.length > 0 && (
                        <tfoot className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <td className="px-4 py-2 text-sm font-medium">Totals</td>
                                <td />
                                <td />
                                <td className="px-4 py-2 text-right text-sm font-medium">
                                    {items.reduce((s, it) => s + Number(it.qty), 0)}
                                </td>
                                <td className="px-4 py-2 text-right text-sm font-medium">
                                    ₹{items.reduce((s, it) => s + Number(it.costPrice) * Number(it.qty), 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-right text-sm font-medium">
                                    ₹{items.reduce((s, it) => s + Number(it.sellingPrice) * Number(it.qty), 0).toFixed(2)}
                                </td>
                                <td />
                                <td />
                                <td />
                                <td />
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            <BarcodeScanner 
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScanSuccess={handleBarcodeScanned}
                title="Scan Product Barcode"
            />
        </div>
    );
}

export default InventoryManager;
