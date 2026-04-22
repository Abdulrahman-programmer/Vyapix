export async function getStockValue(axios , setResult, setLoading, setError, config) {
    try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/api/reports/stock-value", config);
        setResult(response.data);
    } catch (error) {
        console.error('Error fetching stock value:', error);
        setError("Failed to fetch stock value");
    } finally {
        setLoading(false);
        setError(null);
    }   
    
}