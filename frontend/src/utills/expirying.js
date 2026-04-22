export async function fetchExpiringProducts(axios, setResult, setLoading, setError, config) {
    try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/api/reports/expiry", config);
        setResult(response.data);
    } catch (error) {
        console.error('Error fetching expiring products:', error);
        setError("Failed to fetch expiring products");
    } finally {
        setLoading(false);
        setError(null);
    }
}