export async function fetchMostSellingProducts(axios, startDate, endDate , setResult , setLoading , setError, config) {
    try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/reports/most-selling?startDate=${startDate}&endDate=${endDate}`, config);
        setResult(response.data);
    } catch (error) {
        console.error('Error fetching most selling products:', error);
        setError("Failed to fetch most selling products");
    } finally {
        setLoading(false);
        setError(null);
    }
}       
    