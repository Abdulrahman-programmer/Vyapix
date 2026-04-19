//Pages / Inventory.jsx
import {useState , useEffect} from "react";
import InventoryManager from "../components/InventoryManager";
function Inventory(params) {
    return ( 
    <div>
        <h1 className="text-3xl max-w-[80%] font-bold m-auto text-center rounded-2xl bg-white mt-4 p-2 
         transition-all duration-300 dark:bg-gray-700 dark:hover:bg-gray-500 lg:ml-72">Inventory Page</h1>
        <InventoryManager />
    </div> 
);
}
export default Inventory;