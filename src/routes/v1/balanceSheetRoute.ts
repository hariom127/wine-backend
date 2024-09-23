import express from 'express'
import { query, body } from 'express-validator'
import { currentUser, requireAuth, validateRequest } from '../../middleware'
import { balanceSheetControllerV1 } from '../../controller/index'

const router = express.Router()

router.get(
  '/api/v1/balance-sheet',
  currentUser,
  requireAuth,
  [
    query('pageNo').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid page number !'),
    query('limit').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid limit !'),
    query('search').isString().isLength({ min: 1, max: 100 }).optional(),
    query('transactionType').isString().isLength({ min: 2, max: 2 }).optional(),
    query('tag').isString().isLength({ min: 1, max: 100 }).optional(),
    query('fromDate').isString().isLength({ min: 1, max: 100 }).optional(),
    query('toDate').isString().isLength({ min: 1, max: 100 }).optional()
  ],
  validateRequest,
  balanceSheetControllerV1.getBalanceSheet
)


router.post(
  '/api/v1/balance-sheet',
  currentUser,
  requireAuth,
  [
    body('note').isString().isLength({ min: 1, max: 200 }),
    body('transactionType').isString().isLength({ min: 1, max: 2 }),
    body('tag').isString().isLength({ min: 1, max: 20 }),
    body('amount').isNumeric().isLength({ min: 1, max: 999999 }),
    body('date').isDate(),
  ],
  validateRequest,
  balanceSheetControllerV1.createBalanceSheet
)




export { router as balanceSheetRoute }
