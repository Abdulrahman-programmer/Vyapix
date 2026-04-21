export async function updateProduct(axios, productId, payload, config) {
    try {
        const res = await axios.put(`/api/products/${productId}`, payload, config);
        return res.data;
    } catch (error) {
        console.error('Failed to update product:', error);
        throw error;
    }
}   