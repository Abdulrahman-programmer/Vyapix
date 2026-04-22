export async function getDailyProfit(axios , date, setResult, setLoading, setError, config) {
    try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/reports/profit?date=${date}`, config);
        setResult(response.data);
    } catch (error) {
        console.error('Error fetching daily profit:', error);
        setError("Failed to fetch daily profit");
    } finally {
        setLoading(false);
        setError(null);
    }
}