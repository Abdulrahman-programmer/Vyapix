const express = require("express");
const router = express.Router();
 const authController = require("../controllers/authController");


router.post("/register", authController.register);
router.post("/login", authController.login);


// ===== TEST ROUTE =====
router.get("/", (req, res) => {
  res.send("Auth API working");
});

module.exports = router;