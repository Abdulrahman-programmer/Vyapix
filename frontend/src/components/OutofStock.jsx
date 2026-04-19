import axios from "axios";
import React from "react";
import "./components.css";
import closeIcon from "../assets/close.svg";
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
export default function OutofStock(params) {
    const [outofstockItems, setOutofstockItems] = React.useState([]);

    React.useEffect(() => {
        const fetchOutofStockItems = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`/api/products/low-stock/${1}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (Array.isArray(response.data.data)) setOutofstockItems(response.data.data);
            } catch (error) {
                console.error("Error fetching out of stock items:", error);
            }
        };

        fetchOutofStockItems();
    }, []);

    return (
        <div className="fixed  inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="fixed w-md h-1/2 max-w-[80vw] top-50 bg-white p-4 m-4 rounded-lg shadow-md lg:ml-72 dark:bg-gray-800 dark:text-white z-50">
            <h2 className="text-2xl text-center font-bold mb-4 ml-2 lg:ml-4">Out of Stock Items</h2>
            <button onClick={()=> params.close()} className="absolute top-1 right-1  rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <img src={closeIcon} alt="Close" />
            </button>
            {outofstockItems.length === 0 ? (
                <p className="text-center text-gray-500">All products are in stock.</p>
            ) : (
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Product Name</th>
                            
                            <th className="border px-4 py-2">Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {outofstockItems.map((item) => (
                            <tr key={item.id}>
                                <td className="border px-4 py-2 text-center">{item.name}</td>
                                
                                <td className="border px-4  py-2 text-center">{item.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
        </div>
    );
}