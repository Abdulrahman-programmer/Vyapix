const product = require("../models/product");

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

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = await product.findOne({ _id: id, userId: req.user.id });
    if (!productData) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(productData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {barcode, name, category, quantity, costPrice, sellingPrice, purchaseDate, expiryDate } = req.body;

    // validation
    if (!barcode || !name || !category || !quantity || !costPrice || !sellingPrice || !purchaseDate || !expiryDate) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const updatedProduct = await product.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { barcode, name, category, quantity, costPrice, sellingPrice, purchaseDate, expiryDate },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await product.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = await product.findOne({ _id: id, userId: req.user.id });
    if (!productData) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(productData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getProductByQuery = async (req, res) => {
  try {
    const { barcode, name } = req.query;
    const query = { userId: req.user.id };

    if (barcode) {
      query.barcode = barcode;
    }
    if (name) {
      query.name = { $regex: name, $options: "i" }; // case-insensitive search
    }

    const products = await product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 

exports.productsCount = async (req, res) => {
    try {
        const count = await product.countDocuments({ userId: req.user.id });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product count', error: err });
    }
};