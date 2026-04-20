const router = require('express').Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');

router.get("/monthly-max-sold-item", verifyToken, reportController.monthlyMaxSoldItem);

module.exports = router;