export async function fetchSalebyRange(axios, startDate, endDate, setLoading, setError, setSales, authConfig) {
    try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/sales/date-range?startDate=${startDate}&endDate=${endDate}`, authConfig);
        setSales(response.data);
    } catch (error) {
        console.error('Error fetching sales by range:', error);
        setError("Failed to fetch sales by range");
    } finally {
        setLoading(false);
        setError(null);
    }

    
}