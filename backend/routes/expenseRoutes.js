const router = require('express').Router();
const auth = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const { createExpenseSchema } = require('../validations/expenseValidation');
const expenseController = require('../controllers/expenseController')

router.use(auth);
router.post('/', validate(createExpenseSchema), expenseController.createExpense);
router.get('/', expenseController.getExpenses);

module.exports = router;