const cron = require("node-cron");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const { logger } = require("../utils/logger");

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

exports.startBudgetAlertJob = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      const month = currentMonth();
      const budgets = await Budget.find({ month });
      for (const b of budgets) {
        const agg = await Expense.aggregate([
          { $match: { userId: b.userId, isDeleted: false, date: { $gte: new Date(`${month}-01`) } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const spent = agg[0]?.total || 0;
        if (spent > b.totalBudget) {
          const user = await User.findById(b.userId);
          if (user?.email) {
            await sendEmail({
              to: user.email,
              subject: "Budget Exceeded Alert",
              text: `Hi ${user.name}, you have exceeded your budget for ${month}. Spent: ${spent}, Budget: ${b.totalBudget}.`
            });
          }
        }
      }
    } catch (err) {
      logger.error("Budget alert job failed", err);
    }
  });
};