export const fetchProducts = async (axios, config) => {
    try {
        const res = await axios.get('/api/products', config);
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}