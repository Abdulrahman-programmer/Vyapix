const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const storeController = require("../controllers/storeController");


router.post("/add", verifyToken, storeController.addProduct);
router.get("/products", verifyToken, storeController.getProducts);
router.put("/update/:id", verifyToken, storeController.updateProduct);
router.delete("/delete/:id", verifyToken, storeController.deleteProduct);
router.post("/sale", verifyToken, storeController.postSale);
router.get("/sales", verifyToken, storeController.getSales);





module.exports = router;  