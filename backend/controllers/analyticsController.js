const Expense = require('../models/Expense')
const Budget = require('../models/Budget')
const { successResponse } = require('../utils/apiResponse')

exports.monthlySummary = async (req, res, next) => {
    try {
        const { month } = req.query;//yyyy-mm
        const [year, mon] = month.split("-").map(Number);
        const start = new Date(year, mon - 1, 1);
        const end = new Date(year, mon, 1);

        const data = await Expense.aggregate([
            { $match: { userId: req.user._id, isDeleted: false, date: { $gte: start, $lt: end } } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } }
        ])

        const totalSpent = data.reduceRight((sum, c) => sum + c.total, 0);
        const budget = await Budget.findOne({ userId: req.user._id, month });

        return successResponse(res, {
            month,
            totalSpent,
            totalBudget: budget?.totalBudget || 0,
            remaining: (budget?.totalBudget || 0) - totalSpent,
            categoryBreakdown: data.map((d) => ({ category: d._id, total: d.total }))
        }, "Analytics fetched")
    } catch (err) {
        next(err);
    }
}