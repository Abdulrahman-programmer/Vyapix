export async function fetchSales(axios, setLoading, setError, setSales , authConfig) {
    try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/sales', authConfig);
        const data = response.data;
        setSales(data);
    } catch (err) {
        console.error("Error fetching sales:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch sales");
    } finally {
        setLoading(false);
    }
}