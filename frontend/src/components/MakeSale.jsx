import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BarcodeScanner from './BarcodeScanner';


axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; 

export default function MakeSale(params) {

    const [saleCompleted, setSaleCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [scannerOpen, setScannerOpen] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState('');

    // ----------- Helper FUNCTION for ID (fix mismatch issues) -----------
    const getProductId = (p) => String(p.id ?? p._id ?? p.productId ?? p.barcode);

    // ----------- RESET LOGIC (Fixes your Cancel problem) -----------
    const resetSaleState = () => {
        setSelectedIds([]);
        setQuantities({});
        setSelectedCategory('ALL');
        setError(null);
        setBarcodeInput('');
    };

    const handleCancel = () => {
        resetSaleState();
        setIsModalOpen(false);
    };

    // ----------- Fetch Products When Modal Opens -----------
    useEffect(() => {
        if (!isModalOpen) return;

        const fetchProducts = async () => {
            setProductsLoading(true);
            const token = localStorage.getItem('authToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            try {
                const res = await axios.get('/api/store/products', config);
                setProducts(
                    Array.isArray(res.data) 
                        ? res.data 
                        : (res.data.payload || [])
                );
            } catch (err) {
                setError('Could not load products');
                setProducts([]);
            } finally {
                setProductsLoading(false);
            }
        };

        fetchProducts();
    }, [isModalOpen]);

    // ----------- Open Modal -----------
    const openModal = () => {
        resetSaleState();        // ensures clean state every open
        setIsModalOpen(true);
    };

    // ----------- Select / Unselect Product -----------
    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const isSelected = prev.includes(id);
            const next = isSelected ? prev.filter((x) => x !== id) : [...prev, id];

            if (!isSelected) {
                setQuantities((q) => ({ ...q, [id]: "" }));
            }

            return next;
        });
    };

    // ----------- Quantity Handler -----------
    const setQuantityFor = (id, value, maxStock) => {
        if (value === "") {
            setQuantities((q) => ({ ...q, [id]: "" }));
            return;
        }

        let qty = parseInt(value, 10);
        if (!qty || qty < 1) qty = 1;
        if (qty > maxStock) qty = maxStock;

        setQuantities((q) => ({ ...q, [id]: qty }));
    };

    // ----------- Confirm Sale -----------
    const handleConfirmSale = async () => {
        if (selectedIds.length === 0) {
            setError('Please select at least one product');
            return;
        }

        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        const postConfig = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        };

        try {
            
            const items = selectedIds.map((id) => {
                const p = products.find((x) => getProductId(x) === String(id)) || {};
                return {
                    userId: p.userId,
                    productId: p._id || p.productId || id,
                    quantity: Number(quantities[id] || 1),
                    totalPrice: (p.sellingPrice ?? p.price ?? 0) * Number(quantities[id] || 1)
                };
            });

            const results = { success: [], failed: [] };

            for (const item of items) {
                try {
                    await axios.post('/api/store/sale', item, postConfig);
                    results.success.push(item.barcode);
                } catch (e) {
                    results.failed.push({
                        barcode: item.barcode,
                        message: e?.response?.data?.message || e.message
                    });
                }
            }

            if (results.failed.length === 0) {
                setSaleCompleted(true);
                resetSaleState();
                setIsModalOpen(false);

                try { params.refreshSales?.(); } catch {}

                setTimeout(() => setSaleCompleted(false), 2000);
            } else {
                const messages = results.failed
                    .map(f => `${f.barcode}: ${f.message}`)
                    .join('; ');
                setError(`${results.failed.length} item(s) failed: ${messages}`);
            }

        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Sale failed');
        } finally {
            setLoading(false);
        }

        params.fetchOverviewData?.();
    };

    // ----------- Barcode Scanning Functions -----------
    const handleBarcodeScanned = (scannedBarcode) => {
        console.log('Scanned barcode for sale:', scannedBarcode);
        setBarcodeInput(scannedBarcode);
        addProductByBarcode(scannedBarcode);
        setScannerOpen(false);
    };

    const handleBarcodeInput = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addProductByBarcode(barcodeInput);
        }
    };

    const addProductByBarcode = (barcode) => {
        if (!barcode.trim()) return;

        // Find product by barcode
        const product = products.find(p => 
            (p.barcode || '').toString() === barcode.trim() ||
            (p.bracode || '').toString() === barcode.trim()
        );

        if (product) {
            const productId = getProductId(product);
            
            // Check if already selected
            if (selectedIds.includes(productId)) {
                // Increase quantity
                const currentQty = quantities[productId] || 1;
                const maxQty = Number(product.quantity || product.qty || 0);
                
                if (currentQty < maxQty) {
                    setQuantities(prev => ({
                        ...prev,
                        [productId]: currentQty + 1
                    }));
                    setError(null);
                } else {
                    setError(`Maximum quantity reached for ${product.name} (${maxQty} available)`);
                }
            } else {
                // Add new product
                const maxQty = Number(product.quantity || product.qty || 0);
                if (maxQty > 0) {
                    setSelectedIds(prev => [...prev, productId]);
                    setQuantities(prev => ({
                        ...prev,
                        [productId]: 1
                    }));
                    setError(null);
                } else {
                    setError(`Product ${product.name} is out of stock`);
                }
            }
            
            setBarcodeInput('');
        } else {
            setError(`Product not found with barcode: ${barcode}`);
        }
    };

    // ----------- Category List -----------
    const categories = Array.from(
        new Set(
            products
                .map((p) => (p.category ?? p.categoryName ?? '').toString().toUpperCase())
                .filter(Boolean)
        )
    ).sort();

    const displayedProducts =
        selectedCategory === 'ALL'
            ? products
            : products.filter(
                  (p) =>
                      (p.category ?? p.categoryName ?? '')
                          .toString()
                          .toUpperCase() === selectedCategory
              );

    // ----------- RETURN UI -----------
    return (
        <div style={{ padding: '20px' }} className='dark:text-white dark:bg-grey-500'>
            <button
                onClick={openModal}
                className='bg-green-700 rounded-md py-2 text-white w-15 hover:scale-110 px-1.5 lg:px-3 
                shadow-md lg:w-auto hover:bg-green-800 transition-all duration-300'
            >
                Make Sale
            </button>

            {saleCompleted && <p style={{ marginTop: '10px', color: 'green' }}>Sale completed!</p>}
            {error && <p style={{ marginTop: '10px', color: 'red' }}>Error: {error}</p>}

            {isModalOpen && (
                <div className='fixed flex justify-center items-center z-100 top-0 left-0 w-full h-full bg-black/30 dark:text-amber-50'>
                    <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-2xl'
                         style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                        
                        <div className='flex justify-between items-center mb-3'>
                            <h3 className='m-0'>Select Products</h3>
                            
                            <div>
                                <label className='mr-6'>Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className='p-2 rounded dark:bg-gray-700 dark:text-amber-50'
                                >
                                    <option value="ALL">All</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Barcode Input Section */}
                        <div className='mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                            <div className='flex gap-2 items-end'>
                                <div className='flex-1'>
                                    <label className='block text-sm font-medium mb-1'>Quick Add by Barcode</label>
                                    <input
                                        type="text"
                                        value={barcodeInput}
                                        onChange={(e) => setBarcodeInput(e.target.value)}
                                        onKeyPress={handleBarcodeInput}
                                        placeholder="Enter barcode and press Enter"
                                        className='w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500'
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setScannerOpen(true)}
                                    className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500'
                                    title="Scan Barcode"
                                >
                                    📷 Scan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addProductByBarcode(barcodeInput)}
                                    className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500'
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {productsLoading ? (
                            <p>Loading products...</p>
                        ) : (
                            <ul className='list-none p-0'>
                                {displayedProducts.length === 0 ? (
                                    <p>No products available</p>
                                ) : (
                                    displayedProducts.map((p) => {
                                        const id = getProductId(p);
                                        const isSelected = selectedIds.includes(id);
                                        const maxStock = p.quantity ?? p.stock ?? 1;

                                        return (
                                            <li
                                                key={id}
                                                className={
                                                    'flex items-center justify-between py-2 border-b border-gray-300 dark:border-gray-600 ' +
                                                    (isSelected
                                                        ? 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500'
                                                        : '')
                                                }
                                            >
                                                <div
                                                    className='flex-1 cursor-pointer'
                                                    onClick={() => toggleSelect(id)}
                                                >
                                                    <div className='font-semibold'>
                                                        {p.name ?? p.productName ?? p.title ?? `Product ${id}`}
                                                    </div>

                                                    <div className='text-xs text-gray-600 dark:text-amber-50 flex gap-4'>
                                                        <span>Available: {maxStock}</span>
                                                        <span>Price: {p.sellingPrice ?? p.price ?? 'N/A'}</span>
                                                    </div>
                                                </div>

                                                <div className='w-40 flex justify-end items-center gap-2'>
                                                    <label className='dark:text-amber-50'>Qty</label>

                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={maxStock}
                                                        value={
                                                            quantities[id] === "" 
                                                                ? "" 
                                                                : quantities[id] ?? 1
                                                        }
                                                        onChange={(e) =>
                                                            setQuantityFor(id, e.target.value, maxStock)
                                                        }
                                                        disabled={!isSelected}
                                                        className='w-20 p-2 text-sm rounded border border-gray-300
                                                        dark:bg-gray-700 dark:border-gray-600 dark:text-amber-50'
                                                    />
                                                </div>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        )}

                        <div className='flex justify-end gap-3 mt-4'>
                            <button onClick={handleCancel} className='px-3 py-2'>
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirmSale}
                                disabled={loading}
                                className='px-4 py-2 bg-blue-600 text-white rounded'
                            >
                                {loading
                                    ? 'Processing...'
                                    : `Make Sale${selectedIds.length ? ` (${selectedIds.length})` : ''}`}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            <BarcodeScanner 
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScanSuccess={handleBarcodeScanned}
                title="Scan Product for Sale"
            />

        </div>
    );
}
