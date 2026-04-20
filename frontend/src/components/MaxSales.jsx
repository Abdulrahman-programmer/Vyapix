import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
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

  const loadSalesData = async () => {
    try {
      
      const token = localStorage.getItem('authToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};  

      const response = await axios.get("/api/reports/monthly-max-sold-item", config);
      setSalesData(response.data);
      console.log(response);
      
    } catch (error) {
      console.error("Failed to load sales data:", error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    loadSalesData();
  }, []);


  if (loading) return <div className="w-full h-20 bg-white rounded-2xl flex items-center justify-center dark:bg-gray-800">Loading chart...</div>;

  const labels = salesData.map((d) => `${d.month} (${d.item})`);
  const data = {
    labels,
    datasets: [
      {
        label: "Max Sold Item",
        data: salesData.map((d) => d.sold),
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
