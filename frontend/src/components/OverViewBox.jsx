import "./components.css";
import productIcon from "../assets/product.svg";
import orderIcon from "../assets/orders.svg";
import outofstockIcon from "../assets/stockWarning.svg";
import MakeSale from "./MakeSale";
import stockIcon from "../assets/Stock.svg";
import OutofStock from "../components/OutofStock.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

function OverViewBox() {
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalOutOfStock, setTotalOutOfStock] = useState(0);
    const [displayOutofStock, setDisplayOutofStock] = useState(false);

    const fetchOverviewData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            
            const [countRes,totalValue,outOfStockRes,salesRes] = await Promise.all([
                axios.get("/api/store/count", config),
                axios.get("/api/store/value", config),
                axios.get("/api/store/lowStock/1", config),
                axios.get("/api/store/salesCount", config),
            ]);

            setTotalProducts(countRes.data);
            setTotalAmount(totalValue.data);
            setTotalOutOfStock(outOfStockRes.data);
            setTotalOrders(salesRes.data);
           
            
            
        } catch (error) {
            console.error("Failed to fetch overview data:", error);
        }
    };

    useEffect(() => {
        fetchOverviewData();
    }, []);

    return (
        <div className="p-4 m-4 bg-white rounded-lg shadow-md lg:ml-72 dark:bg-gray-800 dark:text-white">
            <h2 className="text-2xl font-bold mb-4 ml-2 lg:ml-4">Overview</h2>
            <div className="container flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="detailBox">
                    <div className="iconBox">
                        <img src={productIcon} alt="" className="w-full" />
                    </div>
                    <div className="values">
                        <p className="text-xl font-bold lg:text-2xl">{totalProducts}</p>
                        <p className="text-xs lg:text-base">Total Products</p>
                    </div>
                </div>
                <div className="detailBox">
                    <div className="iconBox">
                        <img src={stockIcon} alt="" className="w-full" />
                    </div>
                    <div className="values">
                        <p className="text-xl font-bold lg:text-2xl">₹{totalAmount}</p>
                        <p className="text-xs lg:text-base">Total Stock</p>
                    </div>
                </div>
                <div className="detailBox">
                    <div className="iconBox">
                        <img src={orderIcon} alt="" className="w-full" />
                    </div>
                    <div className="values">
                        <p className="text-xl font-bold lg:text-2xl">{totalOrders}</p>
                        <p className="text-xs lg:text-base">Total Orders</p>
                    </div>
                </div>
                <div className="detailBox bg-red-400/20 ring-red-300/50">
                    <div className="iconBox bg-red-200">
                        <img src={outofstockIcon} alt="" className="w-full" />
                    </div>
                    <div className="values text-red-500/50">
                        <p
                            className="text-xl font-bold lg:text-2xl"
                            onClick={() => setDisplayOutofStock(!displayOutofStock)}
                        >
                            {totalOutOfStock}
                        </p>
                        <p className="text-xs lg:text-base">Out Of Stock</p>
                    </div>
                </div>
                <MakeSale fetchOverviewData={fetchOverviewData} />
            </div>
            {displayOutofStock && (
                <OutofStock close={() => setDisplayOutofStock(false)} />
            )}
        </div>
    );
}

export default OverViewBox;