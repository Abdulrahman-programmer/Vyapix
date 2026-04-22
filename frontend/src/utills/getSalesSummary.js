export async function getSalesSummary(axios, startDate, endDate, setResult, setLoading, setError, config) {
    try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/reports/sales-summary?startDate=${startDate}&endDate=${endDate}`, config);
       
        
        
        setResult(response.data.data);
    } catch (error) {
        console.error('Error fetching sales summary:', error);
        setError("Failed to fetch sales summary");
    } finally {
        setLoading(false);
        setError(null);
    }
}