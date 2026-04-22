export async function deleteSale(axios, saleId, config) {
    try {
        const response = await axios.delete(`/api/sales/${saleId}`, config);
        return response.data;
    } catch (error) {
        console.error('Error deleting sale:', error);
        throw error;
    }
}