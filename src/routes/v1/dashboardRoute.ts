import express from 'express';
import { currentUser, requireAuth } from '../../middleware';
import { dashboardController } from '../../controller/DashboardController';

const router = express.Router()

// get sales by shop
router.get(
  '/api/v1/dashboard/sales-by-shop',
  currentUser,
  requireAuth,
  dashboardController.getSalesByShop
)

// get sales by category
router.get(
  '/api/v1/dashboard/sales-by-category',
  currentUser,
  requireAuth,
  dashboardController.getSalesByCategory
)

// get sales by month
router.get(
  '/api/v1/dashboard/sales-by-month',
  currentUser,
  requireAuth,
  dashboardController.getSalesByMonth
)

export { router as dashboardRoutes }
