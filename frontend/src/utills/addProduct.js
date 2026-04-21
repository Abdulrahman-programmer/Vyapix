export async function addProduct(axios, payload, config) {
    try {
        const res = await axios.post('/api/products', payload, config);
        return res.data;
    } catch (error) {
        console.error('Failed to add product:', error);
        throw error;
    }
}   