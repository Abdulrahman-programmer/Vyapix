export async function getProfitRange(axios, startDate, endDate, setResult, setLoading, setError, config) {
    try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`, config);
        console.log(response.data.data);
        
        setResult(response.data.data);
    } catch (error) {
        console.error('Error fetching profit range:', error);
        setError("Failed to fetch profit range");
    } finally {
        setLoading(false);
        setError(null);
    }
}