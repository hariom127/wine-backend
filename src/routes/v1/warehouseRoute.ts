import express from 'express'
import { body, param } from 'express-validator'
import { validateRequest, currentUser, requireAuth } from '../../middleware'
import { warehouseControllerV1 } from '../../controller/index'

const router = express.Router()

router.get(
  '/api/v1/warehouses',
  currentUser,
  requireAuth,
  warehouseControllerV1.getWarehouse
)

router.put(
  '/api/v1/warehouses/:id',
  currentUser,
  requireAuth,
  [
    param('id').isString(),
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('city').isString().isLength({ min: 1, max: 100 }),
    body('state').isString().isLength({ min: 1, max: 100 }),
    body('address').isString().isLength({ min: 1, max: 100 }),
    body('pincode').isInt().isLength({ min: 6, max: 6 })
  ],
  warehouseControllerV1.updateWarehouse
)
export { router as warehouseRoute }
