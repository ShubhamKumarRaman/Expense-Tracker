import incomeModel from "../models/incomeModel.js";
import XLSX from 'xlsx';
import getDateRange from "../utils/dataFilter.js";

// add income
export async function addIncome(req, res) {
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

        const newIncome = new incomeModel({
            userId,
            description,
            amount: parsedAmount,
            category,
            date: parsedDate
        })

        await newIncome.save()

        res.json({
            success: true,
            message: "Income added successfully"
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

// To get income
export async function getAllIncome(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });
        res.json(income);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

//Update an income
export async function updateIncome(req, res) {
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

        const updatedIncome = await incomeModel.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            })
        }

        res.json({
            success: true,
            message: "Income updated successfully",
            data: updatedIncome
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

//To delete an income
export async function deleteIncome(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.findOneAndDelete({ _id: req.params.id, userId });
        if (!income) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            })
        }

        return res.json({
            success: true,
            message: "Income deleted successfully"
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

//To download the data in an excel sheet
export async function downloadIncomeExcel(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 })
        const plainData = income.map((inc) => ({
            Description: inc.description,
            Amount: inc.amount,
            Category: inc.category,
            Date: new Date(inc.date).toLocaleDateString(),
        }))

        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Income")

    const fileBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=income_details.xlsx");
    res.send(fileBuffer)
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

//to get income overview
export async function getIncomeOverview(req, res) {
    try {

        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);

        const incomes = await incomeModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 })

        const totalIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
        const numberOfTransactions = incomes.length;

        const recentTransactions = incomes.slice(0, 9);

        res.json({
            success: true,
            data: {
                totalIncome,
                averageIncome,
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