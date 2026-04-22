export async function monthlyMax(axios , setSalesData , setLoading , config) {
    try {
        setLoading(true);
        const response = await axios.get('/api/reports/monthly-max', config);
        setSalesData(response.data);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching monthly max sales:', error);
        setLoading(false);
    }
    
}