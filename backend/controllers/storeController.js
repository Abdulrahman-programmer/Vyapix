const product = require("../models/product");
const sale = require("../models/sale");

exports.addProduct = async (req, res) => {
  try {
    const {barcode, name, category, quantity, costPrice, sellingPrice, purchaseDate, expiryDate } = req.body;

    // validation
    if (!barcode || !name || !category || !quantity || !costPrice || !sellingPrice || !purchaseDate || !expiryDate) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // check existing product
    const existingProduct = await product.findOne({ barcode });
    if (existingProduct) {
      return res.status(400).json({ message: "Product with this barcode already exists" });
    }

    // create product
    const userId = req.user.id; // get user ID from the authenticated user  
    const newProduct = new product({
      userId,
      barcode,
      name,
      category,
      quantity,
      costPrice,
      sellingPrice,
      purchaseDate,
      expiryDate,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
exports.getProducts = async (req, res) => {
  try {
    const products = await product.find({ userId: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {barcode, name, category, quantity, costPrice, sellingPrice, purchaseDate, expiryDate } = product.findById(id);

    // validation
    if (!barcode || !name || !category || !quantity || !costPrice || !sellingPrice || !purchaseDate || !expiryDate) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // check existing product
    const existingProduct = await product.findOne({ _id: id, userId: req.user.id });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // update product
    existingProduct.barcode = barcode;
    existingProduct.name = name;
    existingProduct.category = category;
    existingProduct.quantity = quantity;
    existingProduct.costPrice = costPrice;
    existingProduct.sellingPrice = sellingPrice;
    existingProduct.purchaseDate = purchaseDate;
    existingProduct.expiryDate = expiryDate;

    await existingProduct.save();

    res.json({
      message: "Product updated successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // check existing product
    const existingProduct = await product.findOne({ _id: id, userId: req.user.id });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne({ _id: id });

    res.json({
      message: "Product deleted successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.productsCount = async (req, res) => {
  try {
    const products = (await product.countDocuments({ userId: req.user.id, quantity: { $gt: 0 } }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.productsValue = async (req, res) => {
  try {
    const products = await product.find({ userId: req.user.id });
    const totalValue = products.reduce((acc, prod) => acc + (prod.sellingPrice * prod.quantity), 0);
    res.json(totalValue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.lowStock = async (req, res) => {
  try {
    const limit = req.params.limit || 1; 
    const products = await product.countDocuments({ userId: req.user.id, quantity: { $lte: 0 } });
    res.json(products);
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

exports.postSale = async (req, res) => {
  try {
    const { userId, productId, quantity, totalPrice } = req.body;
    const newSale = new sale({ userId, productId, quantity, totalPrice });

    // Save the sale and then update the product stock
    await newSale.save().then(async (savedSale) => {
        await this.updateStock(productId, quantity);
    });
    res.status(201).json(newSale);
  } catch (err) {
    res.status(500).json({ message: 'Error creating sale', error: err });
  }
};


exports.getSales = async (req, res) => {
  try {
    const sales = await sale.find().populate('productId');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sales report', error: err });
  }
};

exports.getSalesCount = async (req, res) => {
  try {
    const salesCount = await sale.countDocuments({ userId: req.user.id });
    res.json(salesCount);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sales count', error: err });
  }
};