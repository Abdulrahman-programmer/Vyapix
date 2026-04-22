const product = require("../models/product");
const sale = require("../models/sale");
const mongoose = require("mongoose");

exports.monthlyMaxSoldItem = async (req, res) => {
    try {
        const sales = await sale.aggregate([
            // 1. Filter by user
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },

            // 2. Group by month + productId, sum quantities
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        productId: "$productId"
                    },
                    totalQuantity: { $sum: "$quantity" }
                }
            },

            // 3. Sort by month, then quantity descending
            { $sort: { "_id.year": 1, "_id.month": 1, totalQuantity: -1 } },

            // 4. Group by month — pick the first (highest quantity) product
            {
                $group: {
                    _id: { year: "$_id.year", month: "$_id.month" },
                    productId: { $first: "$_id.productId" },
                    totalQuantity: { $first: "$totalQuantity" }
                }
            },

            // 5. Join with products collection
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },

            // 6. Shape the output
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    productId: "$productId",
                    productName: "$productDetails.name",
                    totalQuantitySold: "$totalQuantity"
                }
            },

            // 7. Sort final result chronologically
            { $sort: { year: 1, month: 1 } }
        ]);

        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching monthly max sold items', error: err });
    }
};

exports.mostSellingProduct = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const sales = await sale.aggregate([
            // 1. Filter by user and date range
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },

            // 2. Group by productId, sum quantities
            {
                $group: {
                    _id: "$productId",
                    totalQuantity: { $sum: "$quantity" }
                }
            },

            // 3. Sort by quantity descending
            { $sort: { totalQuantity: -1 } },

            // 4. Join with products collection
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },

            // 5. Shape the output
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    productName: "$productDetails.name",
                    profitPerUnit: { $subtract: ["$productDetails.sellingPrice", "$productDetails.costPrice"] },
                    totalQuantitySold: "$totalQuantity"
                }
            }
        ]);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching most selling products', error: err });
    }
}

exports.mostSoldItem = async (req, res) => {
    try {
        const { date } = req.query;
        const sales = await sale.aggregate([
            // 1. Filter by user and date
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    createdAt: {
                        $gte: new Date(date),
                        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) // next day
                    }
                }
            },

            // 2. Group by category, sum quantities
            {
                $group: {
                    _id: "$categoryId",
                    totalQuantity: { $sum: "$quantity" }
                }
            },

            // 3. Sort by quantity descending
            { $sort: { totalQuantity: -1 } },

            // 4. Join with categories collection
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },

            // 5. Shape the output
            {
                $project: {
                    _id: 0,
                    categoryId: "$_id",
                    categoryName: "$categoryDetails.name",
                    totalQuantitySold: "$totalQuantity"
                }
            }
        ]);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching most sold categories', error: err });
    }
};

exports.productsValue = async (req, res) => {
    try {
        const sales = await sale.aggregate([
            // 1. Filter by user
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },

            // 2. Join with products to get price
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },

            // 3. Calculate total value for each sale
            {
                $project: {
                    totalValue: { $multiply: ["$quantity", "$productDetails.price"] }
                }
            },

            // 4. Sum total values
            {
                $group: {
                    _id: null,
                    totalInventoryValue: { $sum: "$totalValue" }
                }
            },

            // 5. Shape the output
            {
                $project: {
                    _id: 0,
                    totalInventoryValue: 1
                }
            }
        ]);

        res.json(sales[0] || { totalInventoryValue: 0 });
    } catch (err) {
        res.status(500).json({ message: 'Error calculating inventory value', error: err });
    }   
}

exports.getLowStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const threshold = parseInt(req.query.threshold) || 10;
 
    const products = await product.find(
      { userId, quantity: { $lte: threshold } },
      { name: 1, category: 1, quantity: 1, barcode: 1,costPrice: 1, sellingPrice: 1 }
    ).sort({ quantity: 1 });
 
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
 
    const matchStage =  { userId: new mongoose.Types.ObjectId(userId) };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate)   matchStage.createdAt.$lte = new Date(endDate);
    }
 
    const summary = await sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue:    { $sum: "$totalPrice" },
          totalUnitsSold:  { $sum: "$quantity" },
          totalOrders:     { $sum: 1 },
          avgOrderValue:   { $avg: "$totalPrice" },
        },
      },
      { $project: { _id: 0 } },
    ]);
 
    res.json({ success: true, data: summary[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSalesTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupBy = "day", startDate, endDate } = req.query;
 
    const matchStage = { userId: new require("mongoose").Types.ObjectId(userId) };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate)   matchStage.createdAt.$lte = new Date(endDate);
    }
 
    const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";
 
    const trend = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id:          { $dateToString: { format: dateFormat, date: "$createdAt" } },
          revenue:      { $sum: "$totalPrice" },
          unitsSold:    { $sum: "$quantity" },
          totalOrders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", revenue: 1, unitsSold: 1, totalOrders: 1, _id: 0 } },
    ]);
 
    res.json({ success: true, data: trend });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

exports.getProfitLoss = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
 
    const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate)   matchStage.createdAt.$lte = new Date(endDate);
    }
 
    const report = await sale.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from:         "products",
          localField:   "productId",
          foreignField: "_id",
          as:           "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id:          "$productId",
          name:         { $first: "$product.name" },
          category:     { $first: "$product.category" },
          totalRevenue: { $sum: "$totalPrice" },
          totalCost:    { $sum: { $multiply: ["$product.costPrice", "$quantity"] } },
          unitsSold:    { $sum: "$quantity" },
        },
      },
      {
        $addFields: {
          profit:        { $subtract: ["$totalRevenue", "$totalCost"] },
          profitMargin:  {
            $cond: [
              { $eq: ["$totalRevenue", 0] }, 0,
              { $multiply: [{ $divide: [{ $subtract: ["$totalRevenue", "$totalCost"] }, "$totalRevenue"] }, 100] },
            ],
          },
        },
      },
      { $sort: { profit: -1 } },
      { $project: { _id: 0, name: 1, category: 1, totalRevenue: 1, totalCost: 1, profit: 1, profitMargin: 1, unitsSold: 1 } },
    ]);
 
    // Overall totals
    const totals = report.reduce(
      (acc, item) => {
        acc.totalRevenue += item.totalRevenue;
        acc.totalCost    += item.totalCost;
        acc.totalProfit  += item.profit;
        return acc;
      },
      { totalRevenue: 0, totalCost: 0, totalProfit: 0 }
    );
 
    res.json({ success: true, data: { products: report, totals } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
exports.getdailyprofit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;
 
    const matchStage = {
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) // next day
      }
    };
 
    const report = await sale.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from:         "products",
          localField:   "productId",
          foreignField: "_id",
          as:           "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id:          "$productId",
          name:         { $first: "$product.name" },
          category:     { $first: "$product.category" },
          totalRevenue: { $sum: "$totalPrice" },
          totalCost:    { $sum: { $multiply: ["$product.costPrice", "$quantity"] } },
          unitsSold:    { $sum: "$quantity" },
        },
      },
      {
        $addFields: {
          profit:        { $subtract: ["$totalRevenue", "$totalCost"] },
          profitMargin:  {
            $cond: [
              { $eq: ["$totalRevenue", 0] }, 0,
              { $multiply: [{ $divide: [{ $subtract: ["$totalRevenue", "$totalCost"] }, "$totalRevenue"] }, 100] },
            ],
          },
        },
      },
      { $sort: { profit: -1 } },
      { $project: { _id: 0, name: 1, category: 1, totalRevenue: 1, totalCost: 1, profit: 1, profitMargin: 1, unitsSold: 1 } },
    ]);
 
    // Overall totals
    const totals = report.reduce(
      (acc, item) => {
        acc.totalRevenue += item.totalRevenue;
        acc.totalCost    += item.totalCost;
        acc.totalProfit  += item.profit;
        return acc;
      },
      { totalRevenue: 0, totalCost: 0, totalProfit: 0 }
    );
 
    res.json({ success: true, data: { products: report, totals } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, sortBy = "quantity" } = req.query;
 
    const sortField = sortBy === "revenue" ? "totalRevenue" : "totalQuantity";
 
    const topProducts = await Sale.aggregate([
      { $match: { userId: new require("mongoose").Types.ObjectId(userId) } },
      {
        $group: {
          _id:           "$productId",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue:  { $sum: "$totalPrice" },
          totalOrders:   { $sum: 1 },
        },
      },
      { $sort: { [sortField]: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from:         "products",
          localField:   "_id",
          foreignField: "_id",
          as:           "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId:     "$_id",
          name:          "$product.name",
          category:      "$product.category",
          sellingPrice:  "$product.sellingPrice",
          totalQuantity: 1,
          totalRevenue:  1,
          totalOrders:   1,
        },
      },
    ]);
 
    res.json({ success: true, data: topProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
exports.getExpiryReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;
 
    const today    = new Date();
    const deadline = new Date();
    deadline.setDate(today.getDate() + days);
 
    const products = await product.find(
      { userId, expiryDate: { $gte: today, $lte: deadline } },
      { name: 1, category: 1, quantity: 1, barcode: 1, expiryDate: 1 }
    ).sort({ expiryDate: 1 });
 
    // Also fetch already expired
    const expired = await product.find(
      { userId, expiryDate: { $lt: today } },
      { name: 1, category: 1, quantity: 1, barcode: 1, expiryDate: 1 }
    ).sort({ expiryDate: 1 });
 
    res.json({
      success: true,
      data: {
        expiringSoon: products,
        alreadyExpired: expired,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategoryReport = async (req, res) => {
  try {
    const userId = req.user.id;
 
    // Sales by category
    const salesByCategory = await Sale.aggregate([
      { $match: { userId: new require("mongoose").Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "products", localField: "productId", foreignField: "_id", as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id:          "$product.category",
          totalRevenue: { $sum: "$totalPrice" },
          unitsSold:    { $sum: "$quantity" },
          totalOrders:  { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $project: { _id: 0, category: "$_id", totalRevenue: 1, unitsSold: 1, totalOrders: 1 } },
    ]);
    // Stock by category
    const stockByCategory = await Product.aggregate([
      { $match: { userId: new require("mongoose").Types.ObjectId(userId) } },
      {
        $group: {
          _id:           "$category",
          totalProducts: { $sum: 1 },
          totalStock:    { $sum: "$quantity" },
          totalValue:    { $sum: { $multiply: ["$costPrice", "$quantity"] } },
        },
      },
      { $project: { _id: 0, category: "$_id", totalProducts: 1, totalStock: 1, totalValue: 1 } },
    ]);
 
    res.json({ success: true, data: { salesByCategory, stockByCategory } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInventoryValuation = async (req, res) => {
  try {
    const userId = req.user.id;
 
    const valuation = await product.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) }  },
      {
        $group: {
          _id:              null,
          totalCostValue:   { $sum: { $multiply: ["$costPrice", "$quantity"] } },
          totalSellValue:   { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
          totalProducts:    { $sum: 1 },
          totalUnits:       { $sum: "$quantity" },
        },
      },
      {
        $addFields: {
          potentialProfit: { $subtract: ["$totalSellValue", "$totalCostValue"] },
        },
      },
      { $project: { _id: 0 } },
    ]);
 
    res.json({ success: true, data: valuation[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

