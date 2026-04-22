export async function fetchLowProduct(axios, threshold, config) {
    try {
        const response = await axios.get(`/api/reports/low-stock?threshold=${threshold}`, config);
        return response;
    } catch (error) {
        console.error('Error fetching low products:', error);
        throw error;
    }

    
}