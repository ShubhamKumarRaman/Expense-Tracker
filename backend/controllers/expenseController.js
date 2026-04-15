const Expense = require('../models/Expense')
const { successResponse } = require('../utils/apiResponse')

exports.createExpense = async (req, res, next) => {
    try {
        const expense = await Expense.create({ ...req.body, userId: req.user._id });
        return successResponse(res, expense, "Expense added", 201);
    } catch (err) {
        next(err);
    }
}

exports.getExpenses = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = "-date", category, minAmount, maxAmount, startDate, endDate, search } = req.query;
        const query = { userId: req.user._id, isDeleted: false };

        if (category) query.category = category;
        if (minAmount || maxAmount)
            query.amount = { ...(minAmount && { $gte: Number(minAmount) }), ...(maxAmount && { $lte: Number(maxAmount) }) };

        if (startDate || endDate)
            query.date = { ...(startDate && { $gte: new Date(startDate) }), ...(endDate && { $lte: new Date(endDate) }) };

        if (search)
            query.title = { $regex: search, $options: "i" }

        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            Expense.find(query).sort(sort).skip(skip).limit(Number(limit)),
            Expense.countDocuments(query)
        ]);

        return successResponse(res, { items, pagination: { page: Number(page), limit: Number(limit), total } }, "Expense fetched")
    } catch (err) {
        next(err);
    }
}