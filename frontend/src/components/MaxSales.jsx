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

const fetchMonthlyMaxSales = async (year = "2025") => {
  try {
    const token = localStorage.getItem("authToken");
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01T00:00:00`;
      const endDate = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${endDate}T23:59:59`;

      const res = await axios.get(
        `/api/reports/most-selling-products?startDate=${start}&endDate=${end}`,
        config
      );

      const topItem = res.data.data?.[0];

      monthlyData.push({
        month: monthNames[month],
        item: topItem?.productName || "N/A",
        sold: topItem?.totalQuantitySold || 0,
      });
    }

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    return [];
  }
};

const MaxSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data in background
    fetchMonthlyMaxSales(new Date().getFullYear()).then((data) => {
      setSalesData(data);
      setLoading(false);
    });
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
