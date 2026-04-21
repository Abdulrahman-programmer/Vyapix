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
        const { startDate, endDate } = req.params;
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
        const { date } = req.params;
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

exports.lowStock = async (req, res) => {

    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 5; // default to 5 if not provided
        const lowStockProducts = await sale.aggregate([
            // 1. Filter by user
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },

            // 2. Join with products to get stock
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },

            // 3. Filter products with stock < 5
            {
                $match: {
                    "productDetails.stock": { $lt: limit}
                }
            },

            // 4. Shape the output
            {
                $project: {
                    _id: 0,
                    productId: "$productId",
                    productName: "$productDetails.name",
                    stock: "$productDetails.stock"
                }
            }
        ]);

        res.json(lowStockProducts);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching low stock products', error: err });
    }
}

