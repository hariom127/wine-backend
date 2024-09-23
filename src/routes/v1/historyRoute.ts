import express from 'express'
import { query } from 'express-validator'
import { currentUser, requireAuth, validateRequest } from '../../middleware'
import { historyControllerV1 } from '../../controller/index'

const router = express.Router()

router.get(
  '/api/v1/history',
  currentUser,
  requireAuth,
  [
    query('pageNo').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid page number !'),
    query('limit').isString().isLength({ min: 1, max: 100 }).withMessage('Provide a valid limit !'),
    query('fromDate').isString().isLength({ min: 1, max: 100 }).optional(),
    query('toDate').isString().isLength({ min: 1, max: 100 }).optional()
  ],
  validateRequest,
  historyControllerV1.getHistory
);

export { router as historyRoute }
