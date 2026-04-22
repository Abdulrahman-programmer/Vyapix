const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const controller = require("../controllers/saleController");

// Sales
router.post("/", verifyToken, controller.postSale);
router.get("/", verifyToken, controller.getSales);
router.get("/count", verifyToken, controller.getSalesCount);
router.delete("/:id", verifyToken, controller.deleteSale);


router.get("/", verifyToken, controller.getSalesByDate);
router.get("/date-range", verifyToken, controller.getSalesByDateRange);

module.exports = router;