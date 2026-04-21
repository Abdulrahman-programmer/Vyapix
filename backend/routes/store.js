const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const storeController = require("../controllers/storeController");


router.post("/add", verifyToken, storeController.addProduct);
router.get("/products", verifyToken, storeController.getProducts);
router.get("/product", verifyToken, storeController.getProductByBarcode);
router.put("/update/:id", verifyToken, storeController.updateProduct);
router.delete("/delete/:id", verifyToken, storeController.deleteProduct);
router.get("/count", verifyToken, storeController.productsCount);
router.get("/value", verifyToken, storeController.productsValue);
router.get("/lowStock/:limit", verifyToken, storeController.lowStock);
router.post("/sale", verifyToken, storeController.postSale);
router.get("/sales", verifyToken, storeController.getSales);
router.get("/salesCount", verifyToken, storeController.getSalesCount);
router.delete("/sale/:id", verifyToken, storeController.deleteSale);




module.exports = router;  