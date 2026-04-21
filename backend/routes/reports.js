const router = require('express').Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');
const controller = require('../controllers/storeController');

// Sales reports

router.get("/monthly-max-sold-item", verifyToken, reportController.monthlyMaxSoldItem);
router.get("/most-selling-product/:startDate/:endDate", verifyToken, reportController.mostSellingProduct);
router.get("/most-selling-category/:date", verifyToken, reportController.mostSoldItem);


// Inventory reports

router.get("/value", verifyToken, controller.productsValue);
router.get("/low-stock", verifyToken, controller.lowStock);

module.exports = router;

