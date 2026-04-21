const sale = require("../models/sale");

exports.postSale = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // validation
    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product ID and quantity are required" });
    }

    // create sale
    const userId = req.user.id;
    const totalPrice = req.body.totalPrice; // get total price from the request body
    const newSale = new sale({
      userId,
      productId,
      quantity,
      totalPrice,
      createdAt: new Date(),
    });

    await this.updateStock(productId, quantity)
    .then(() => {
        newSale.save();
    })
    .catch((err) => {
        return res.status(500).json({ error: "Error updating stock: " + err.message });
    });
    

    res.status(201).json({
      message: "Sale recorded successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getSales = async (req, res) => {
  try {
    const sales = await sale.find({ userId: req.user.id }).populate('productId');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getSalesCount = async (req, res) => {
  try {
    const count = await sale.countDocuments({ userId: req.user.id });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    await sale.findByIdAndDelete(id);
    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.updateStock = async (productId, soldQuantity) => {
  try {
    const existingProduct = await product.findById(productId);
    if (!existingProduct) {
      throw new Error("Product not found");
    }
    existingProduct.quantity -= soldQuantity;
    await existingProduct.save();
  } catch (err) {
    console.error("Error updating stock: ", err);   
  }
}   
