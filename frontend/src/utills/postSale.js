export async function postSale(axios, saleData, config) {
    try {
        const response = await axios.post('/api/sales', saleData, config);
        return response.data;
    } catch (error) {
        console.error('Error posting sale:', error);
        throw error;
    }
}   