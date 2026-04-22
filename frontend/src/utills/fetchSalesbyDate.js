export async function fetchSalesbyDate(axios, date, setLoading, setError, setSales, authConfig) {
    try {
        setLoading(true);
        setError(null);
        console.log(date);
        
        const response = await axios.get(`/api/sales/${date}`, authConfig);
        
        setSales(response.data);
    } catch (error) {
        console.error('Error fetching sales by date:', error);
        setError("Failed to fetch sales by date");
    } finally {
        setLoading(false);
        setError(null);
    }

}