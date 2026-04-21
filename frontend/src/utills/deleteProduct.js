export async  function deleteProduct(axios, id, config) {
      await axios.delete(`/products/${id}`, config);
}