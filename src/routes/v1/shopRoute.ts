import express from 'express'
import { param, query, body } from 'express-validator'
import { currentUser, requireAuth, validateRequest } from '../../middleware'
import { shopControllerV1 } from '../../controller/index'

const router = express.Router()

router.get(
  '/api/v1/shops',
  currentUser,
  requireAuth,
  [
    query('pageNo').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid page number !'),
    query('limit').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid limit !'),
  ],
  validateRequest,
  shopControllerV1.getShops
)

/**
 * Update shop details
 */
router.put(
  '/api/v1/shops/:id',
  currentUser,
  requireAuth,
  [
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('city').isString().isLength({ min: 1, max: 100 }),
    body('state').isString().isLength({ min: 1, max: 100 }),
    body('address').isString().isLength({ min: 1, max: 100 }),
    body('pincode').isInt({ min: 100000 }).isLength({ min: 6, max: 6 })
  ],
  validateRequest,
  shopControllerV1.updateShop
)

router.get(
  '/api/v1/shops/:id',
  currentUser,
  requireAuth,
  [
    param('id').isString().withMessage('Provide a valid ID !')
  ],
  validateRequest,
  shopControllerV1.getShopDetails
)

router.get(
  '/api/v1/shops/:id/products',
  currentUser,
  requireAuth,
  [
    param('id').isString().withMessage('Provide a valid ID !'),
    query('pageNo').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid page number !'),
    query('limit').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid limit !'),
    query('search').isString().isLength({ min: 0, max: 200 }).optional(),
    query('qtySort').isInt({ min: -1, max: 1 }),
  ],
  validateRequest,
  shopControllerV1.getShopProducts
)

router.post(
  '/api/v1/shops/:id/products',
  currentUser,
  requireAuth,
  [
    body('productId').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid product !'),
    body('boxQty').isInt({ min: 0 }).withMessage('boxQty must be a non-negative integer'),
    body('looseQty').isInt({ min: 0 }).withMessage('looseQty must be a non-negative integer'),
  ],
  validateRequest,
  shopControllerV1.importProduct
)

//***** Not inline qty update *****/
// router.post(
//   '/api/v1/shops/:shopId/products/:productId',
//   currentUser,
//   requireAuth,
//   [
//     param('shopId').isString().isLength({ min: 1, max: 100 }),
//     param('productId').isString().isLength({ min: 1, max: 100 }),
//     body('qty').isInt({ min: 0 })
//   ],
//   validateRequest,
//   shopControllerV1.importProduct
// )

export { router as shopRoute }
