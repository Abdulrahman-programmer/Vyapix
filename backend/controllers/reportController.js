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


