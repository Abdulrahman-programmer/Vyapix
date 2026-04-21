import { useState, useEffect } from "react";
import axios from "axios";

export default function useInventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/products");
            setItems(res.data?.data || res.data || []);
        } catch {
            setError("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (payload) => {
        const res = await axios.post("/api/products", payload);
        setItems(prev => [res.data, ...prev]);
    };

    const updateItem = async (id, payload) => {
        await axios.put(`/api/products/${id}`, payload);
        setItems(prev => prev.map(i => i._id === id ? { ...i, ...payload } : i));
    };

    const deleteItem = async (id) => {
        await axios.delete(`/api/products/${id}`);
        setItems(prev => prev.filter(i => i._id !== id));
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return { items, loading, error, addItem, updateItem, deleteItem };
}