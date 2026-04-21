const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const controller = require("../controllers/productController");

// Products CRUD
router.post("/", verifyToken, controller.addProduct);
router.get("/", verifyToken, controller.getProducts);

// Query-based search (barcode, name, etc.)
router.get("/search", verifyToken, controller.getProductByQuery);
router.get("/count", verifyToken, controller.productsCount);

// Single product
router.get("/:id", verifyToken, controller.getProductById);
router.put("/:id", verifyToken, controller.updateProduct);
router.delete("/:id", verifyToken, controller.deleteProduct);

module.exports = router;