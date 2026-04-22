import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { monthlyMax } from "../utills/montlyMax";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);



const MaxSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  
  
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    monthlyMax(axios, setSalesData, setLoading, config);  
  }, []);


  if (loading) return <div className="w-full h-20 bg-white rounded-2xl flex items-center justify-center dark:bg-gray-800">Loading chart...</div>;

  const labels = salesData.map((d) => `${months[d.month - 1]} (${d.productName})`);
  const data = {
    labels,
    datasets: [
      {
        label: "Max Sold Item",
        data: salesData.map((d) => d.totalQuantitySold),
        backgroundColor: "rgba(6, 57, 135, 1)",
        borderRadius: 5,
        barThickness: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Maximum Sold Item in Each Month" },
      tooltip: {
        callbacks: {
          label: function (context) {
            const idx = context.dataIndex;
            return `${salesData[idx].item}: ${salesData[idx].sold}`;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Units Sold" } },
      x: { title: { display: true, text: "Month" } },
    },
  };

  return (
    <div className="chartBox">
      <Bar data={data} options={options} />
    </div>
  );
};

export default MaxSales;
