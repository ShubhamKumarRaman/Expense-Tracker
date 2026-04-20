import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dataFilter.js";
import XLSX from 'xlsx'

//add expense
export async function addExpense(req, res) {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a valid number greater than 0"
            })
        }

        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date"
            })
        }

        const newExpense = new expenseModel({
            userId,
            description,
            amount: parsedAmount,
            category,
            date: parsedDate
        })

        await newExpense.save()

        res.json({
            success: true,
            message: "Expense added successfully"
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

//Get all expenses
export async function getAllExpense(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

//To update the expense
export async function updateExpense(req, res) {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;

    try {
        const updateData = {};

        if (description !== undefined) {
            updateData.description = description;
        }

        if (amount !== undefined) {
            const parsedAmount = Number(amount);
            if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Amount must be a valid number greater than 0"
                })
            }
            updateData.amount = parsedAmount;
        }

        if (category !== undefined) {
            updateData.category = category;
        }

        if (date !== undefined) {
            const parsedDate = new Date(date);
            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date"
                })
            }
            updateData.date = parsedDate;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            })
        }

        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            })
        }

        res.json({
            success: true,
            message: "Expense updated successfully",
            data: updatedExpense
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

//Delete an expense
export async function deleteExpense(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.findOneAndDelete({ _id: req.params.id, userId });
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            })
        }

        return res.json({
            success: true,
            message: "Expense deleted successfully"
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

//download excel for expense
export async function downloadExpenseExcel(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 })
        const plainData = expense.map((exp) => ({
            Description: exp.description,
            Amount: exp.amount,
            Category: exp.category,
            Date: new Date(exp.date).toLocaleDateString(),
        }))

        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "expense")

        const fileBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=expense_details.xlsx");
        res.send(fileBuffer)
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

//to get overview of expense
export async function getexpenseOverview(req, res) {
    try {

        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);

        const expenses = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 })

        const totalExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const averageExpense = expenses.length > 0 ? totalexpense / expenses.length : 0;
        const numberOfTransactions = expenses.length;

        const recentTransactions = expenses.slice(0, 5);

        res.json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}