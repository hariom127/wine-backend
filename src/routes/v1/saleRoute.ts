import express from 'express'
import { body, query } from 'express-validator'
import { validateRequest, currentUser, requireAuth } from '../../middleware'
import { saleControllerV1 } from '../../controller/index'

const router = express.Router()

// add sell
router.post(
  '/api/v1/sales',
  currentUser,
  requireAuth,
  [
    body('productId').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid product !'),
    body('shopId').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid shop Id !'),
    body('boxQty').isInt({ min: 0 }).withMessage('boxQty must be a non-negative integer'),
    body('looseQty').isInt({ min: 0 }).withMessage('looseQty must be a non-negative integer'),
    body('sellingPrice').isInt({ min: 0 }).withMessage('sellingPrice must be a non-negative integer'),
    body('discount').isInt({ min: 0 }).optional().default(0).withMessage('discount must be a non-negative integer'),
    body('date').isNumeric().withMessage('Provide a valid date'),
  ],
  validateRequest,
  saleControllerV1.addSale
)
// get sales list
router.get(
  '/api/v1/sales',
  currentUser,
  requireAuth,
  [
    query('pageNo').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid page number !'),
    query('limit').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid limit !'),
    query('search').isString().isLength({ min: 1, max: 100 }).optional(),
    query('category').isString().isLength({ min: 1, max: 100 }).optional(),
    query('shop').isString().isLength({ min: 1, max: 100 }).optional(),
    query('fromDate').isString().isLength({ min: 1, max: 100 }).optional(),
    query('toDate').isString().isLength({ min: 1, max: 100 }).optional()
  ],
  saleControllerV1.getSales
)

// get sales list
router.delete(
  '/api/v1/sales/:id',
  currentUser,
  requireAuth,
  saleControllerV1.deleteSales
)
export { router as saleRoutes }
