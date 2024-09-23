import express from 'express'
import { query } from 'express-validator'
import { currentUser, requireAuth, validateRequest } from '../../middleware'
import { categoryControllerV1 } from '../../controller/index'

const router = express.Router()

router.get(
  '/api/v1/categories',
  currentUser,
  requireAuth,
  [
    query('search').isString().optional().default(""),
    query('category').isString().optional().default(""),
    query('pagination').isBoolean().optional().default(true),
    query('pageNo').isInt().default(1).withMessage('Provide a valid page number !'),
    query('limit').isInt().isLength({ min: 1, max: 100 }).withMessage('Provide a valid limit !'),
  ],
  validateRequest,
  categoryControllerV1.getCategories
)
export { router as categoryRoute }
