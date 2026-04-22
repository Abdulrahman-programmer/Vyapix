import React, { useState, useEffect } from "react";
import axios from "axios";
import BarcodeScanner from "./BarcodeScanner";
import { fetchProducts } from "../utills/fetchProducts";
import { updateProduct } from "../utills/updateProduct";
import { addProduct } from "../utills/addProduct";
import { deleteProduct } from "../utills/deleteProduct";

// set base URL for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

const normalizeItem = (it) => {
  const id = it.id ?? it.productId ?? it._id ?? it.product_id ?? null;
  const barcode = it.barcode ?? it.bracode ?? it.barCode ?? "";
  const qty = Number(it.qty ?? it.quantity ?? 0);
  const costPrice = Number(it.costPrice ?? it.cost ?? 0);
  const sellingPrice = Number(it.sellingPrice ?? it.selling ?? 0);
  return {
    ...it,
    id,
    barcode,
    name: (it.name ?? "").toString().toUpperCase(),
    category: (it.category ?? "").toString().toUpperCase(),
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
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [qty, setQty] = useState("");
  const [costPrice, setCostPrice] = useState("");

  const [sellingPrice, setSellingPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const formatDate = (date) => {
  return date ? date.split("T")[0] : "";
};
  const config = localStorage.getItem("authToken")
    ? {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    : {};

  const [scanLock, setScanLock] = useState(false); // to prevent multiple rapid scans

  // Fetch from backend on mount
  useEffect(() => {
  fetchProducts(axios, config)
    .then((data) => {
      const normalized = data.map(normalizeItem);
      setItems(normalized);
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
      setError("Failed to load products from server.");
    });
}, [items]); 

  const resetForm = () => {
    setName("");
    setCategory("");
    setQty("");
    setCostPrice("");
    setSellingPrice("");
    // setBarcode('');
    setPurchaseDate("");
    setExpiryDate("");
    setEditingId(null);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!name.trim()) return;

  const payload = {
    barcode: barcode || Date.now().toString(),
    name: name.trim().toUpperCase(),
    category: category.trim().toUpperCase(),
    quantity: Number(qty) || 0,
    costPrice: Number(costPrice) || 0,
    sellingPrice: Number(sellingPrice) || 0,
    purchaseDate: purchaseDate || null,
    expiryDate: expiryDate || null,
    status: "ACTIVE",
  };

  try {
    if (editingId) {
      const updated = await updateProduct(axios, editingId, payload, config);
      const normalized = normalizeItem(updated);

      setItems((prev) =>
        prev.map((it) =>
          String(it.id) === String(editingId) ? normalized : it
        )
      );
    } else {
      const created = await addProduct(axios, payload, config);
      const normalized = normalizeItem(created);

      setItems((prev) => [...prev, normalized]);
    }
    
    resetForm();
  } catch (err) {
    console.error(err);
    setError("Failed to save product");
  }
};


  const handleEdit = (it) => {
    setName(it.name);
    setCategory(it.category || "");
    setQty(String(it.qty));
    setCostPrice(String(it.costPrice ?? ""));
    setSellingPrice(String(it.sellingPrice ?? ""));
    setBarcode(it.barcode ?? it.bracode ?? "");
    setPurchaseDate(it.purchaseDate ?? "");
    setExpiryDate(it.expiryDate ?? "");
    setEditingId(
      it.id ??
        it.productId ??
        it._id ??
        it.product_id ??
        it.barcode ??
        it.bracode ??
        null,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      deleteProduct(axios, id, config);
      setItems((prev) => prev.filter((it) => String(it.id) !== String(id)));  
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
  };

 const handleBarcodeScanned = async (scannedBarcode) => {
  if (scanLock) return;
  setScanLock(true);

  setBarcode(scannedBarcode);

  const setDefaultDates = () => {
    const today = new Date().toISOString().split("T")[0];
    setPurchaseDate(today);

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setExpiryDate(nextYear.toISOString().split("T")[0]);
  };

  try {
    const response = await axios.get(
      `/api/products/search?barcode=${scannedBarcode}`, // ✅ fixed route
      config
    );

    const raw = response.data;
    const products = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.data)
      ? raw.data
      : raw.product
      ? [raw.product]
      : [];

    if (products.length > 0) {
      const product = products[0];
      const normalizedProduct = normalizeItem(product);

      const action = window.confirm(
        `Product found!\n\nName: ${normalizedProduct.name}\nCategory: ${normalizedProduct.category}\nCurrent Quantity: ${normalizedProduct.qty}\nPrice: ₹${normalizedProduct.sellingPrice}\n\nClick OK to edit this product, or Cancel to create a new product.`
      );

      if (action) {
        handleEdit(normalizedProduct);
      } else {
        resetForm();
        setDefaultDates();
      }
    } else {
      resetForm();
      setDefaultDates();
    }
  } catch (error) {
    console.warn("Error checking existing product:", error);
    resetForm();
    setDefaultDates();
  }

  setScannerOpen(false);

  // ✅ IMPORTANT: unlock scanner
  setTimeout(() => setScanLock(false), 500);
};

  return (
    <div className="max-w-[80%] mx-auto mt-6 p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800 lg:ml-72">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {/* Barcode */}
        <div className="xl:col-span-2 sm:col-span-2">
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
            >
              📷
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="xl:col-span-2 sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
            placeholder="Item name"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
            placeholder="Category"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            type="number"
            min="0"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
          />
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Cost Price</label>
          <input
            value={costPrice}
            onChange={(e) => setCostPrice(Number(e.target.value))}
            type="number"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
          />
        </div>

        {/* Selling Price */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Selling Price
          </label>
          <input
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
            type="number"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
          />
        </div>

        {/* Purchase Date */}
        <div className="sm:col-span-1 lg:col-span-2 xl:col-span-3">
          <label className="block text-sm font-medium mb-1">
            Purchase Date
          </label>
          <input
            value={formatDate(purchaseDate)}
            onChange={(e) => setPurchaseDate(e.target.value)}
            type="date"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
          />
        </div>

        {/* Expiry Date */}
        <div className="sm:col-span-1 lg:col-span-2 xl:col-span-3">
          <label className="block text-sm font-medium mb-1">Expiry Date</label>
          <input
            value={formatDate(expiryDate)}
            onChange={(e) => setExpiryDate(e.target.value)}
            type="date"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
          />
        </div>

        {/* Buttons */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-6 flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            {editingId ? "Update" : "Add"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">#</th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Barcode
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Category
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium">
                Quantity
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium">Cost</th>
              <th className="px-4 py-2 text-right text-sm font-medium">
                Selling
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Purchase Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Expiry Date
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No items yet.
                </td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr
                  key={it.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {it.barcode || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{it.name}</td>
                  <td className="px-4 py-3 text-sm">{it.category || "-"}</td>
                  <td className="px-4 py-3 text-sm text-right">{it.qty}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    ₹{Number(it.costPrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    ₹{Number(it.sellingPrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDate(it.purchaseDate) || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(it.expiryDate) || "-"}</td>
                  <td className="px-4 py-3 text-sm text-center space-x-2">
                    <button
                      onClick={() => handleEdit(it)}
                      className="px-2 py-1 bg-yellow-400 rounded-md hover:bg-yellow-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(it.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-400"
                    >
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
                <td className="px-4 py-2 text-right text-sm font-medium" colSpan={2}>
                  {items.reduce((s, it) => s + Number(it.qty), 0)}
                </td>
                <td className="px-4 py-2 text-right text-sm font-medium">
                  ₹
                  {items
                    .reduce(
                      (s, it) => s + Number(it.costPrice) * Number(it.qty),
                      0,
                    )
                    .toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right text-sm font-medium" >
                  ₹
                  {items
                    .reduce(
                      (s, it) => s + Number(it.sellingPrice) * Number(it.qty),
                      0,
                    )
                    .toFixed(2)}
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
