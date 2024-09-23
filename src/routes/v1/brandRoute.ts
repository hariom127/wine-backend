import express from 'express'
import { query } from 'express-validator'
import { currentUser, requireAuth, validateRequest } from '../../middleware'
import { brandControllerV1 } from '../../controller/index'

const router = express.Router()

router.get(
  '/api/v1/brands',
  currentUser,
  requireAuth,
  [
    query('pageNo').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid page number !'),
    query('limit').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid limit !'),
    query('search').isString().isLength({ max: 100 }).optional(),
    query('category').isString().isLength({ max: 100 }).optional(),
  ],
  validateRequest,
  brandControllerV1.getBrands
)

router.get(
  '/api/v1/brands/all',
  currentUser,
  requireAuth,
  [
    query('categoryId').isString().optional(),
  ],
  validateRequest,
  brandControllerV1.getAllBrands
)
export { router as brandRoute }
