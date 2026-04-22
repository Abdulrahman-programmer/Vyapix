const router = require('express').Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);
// Sales
router.get("/monthly-max",      reportController.monthlyMaxSoldItem); // ?startDate= &endDate=
router.get("/most-selling",       reportController.mostSellingProduct);     
router.get("/sales-summary",    reportController.getSalesSummary);   // ?startDate= &endDate=
router.get("/sales-trend",      reportController.getSalesTrend);     // ?groupBy=day|month &startDate= &endDate=
router.get("/top-products",     reportController.getTopProducts);    // ?limit=10 &sortBy=quantity|revenue
 
// Finance
router.get("/profit-loss",      reportController.getProfitLoss);     // ?startDate= &endDate=
router.get("/inventory-value",  reportController.getInventoryValuation);
router.get("/profit" , reportController.getdailyprofit);


 
// Inventory Health
router.get("/low-stock",        reportController.getLowStock);       // ?threshold=10
router.get("/expiry",           reportController.getExpiryReport);   // ?days=30
router.get("/stock-value",      reportController.getInventoryValuation);
 
// Category
router.get("/category",         reportController.getCategoryReport);


module.exports = router;

