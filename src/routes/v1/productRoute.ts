import express from 'express'
import { body, query, param } from 'express-validator'
import { validateRequest, currentUser, requireAuth } from '../../middleware'
import { productControllerV1 } from '../../controller/index'

const router = express.Router()

router.get(
  '/api/v1/products',
  currentUser,
  requireAuth,
  [
    query('pageNo').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid page number !'),
    query('limit').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid limit !'),
  ],
  productControllerV1.getProducts
)

router.post(
  '/api/v1/products',
  currentUser,
  requireAuth,
  [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid name !'),
    body('packing').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid limit !'),
    body('MRP').isNumeric().isLength({ min: 1, max: 999999 }).withMessage('Provide a valid MRP !'),
    body('purchasePrice').isNumeric().isLength({ min: 1, max: 999999 }).withMessage('Provide a valid purchase price !'),
    body('sellingPrice').isNumeric().isLength({ min: 1, max: 999999 }).withMessage('Provide a valid selling price !'),
    body('category._id').isString().withMessage('Provide a valid category !'),
    body('category.name').isString().withMessage('Provide a valid category !'),
    body('brandId').isString().withMessage('Provide a valid brand !'),
    body('warehouseId').isString().withMessage('Provide a valid warehouse !'),
    body('shopId').isString().withMessage('shop is required !'),
    body('qtyPerBox').isInt({ min: 1 }).withMessage('Quantity per box is required !'),
    body('boxQty').isInt({ min: 0 }).withMessage('boxQty must be a non-negative integer'),
    body('looseQty').isInt({ min: 0 }).withMessage('looseQty must be a non-negative integer'),
    body().custom((value, { req }) => {
      if (!req.body.boxQty && !req.body.looseQty) {
        throw new Error('Either box-quantity or loose-quantity must be provided.');
      }
      return true;
    })

  ],
  validateRequest,
  productControllerV1.createProduct
)

router.delete(
  '/api/v1/products/:id',
  currentUser,
  requireAuth,
  [
    param('id').isString(),
  ],
  productControllerV1.deleteProduct
)

router.patch(
  '/api/v1/products/:id',
  currentUser,
  requireAuth,
  [
    param('id').isString(),
    body('qty').isInt({ min: 0, max: 100000 }),
  ],
  productControllerV1.updateQty
)

export { router as productRoute }
