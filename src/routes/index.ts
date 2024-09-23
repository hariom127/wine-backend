import { authRoute } from './v1/authRoute';
import { categoryRoute } from './v1/categoryRoute';
import { brandRoute } from './v1/brandRoute';
import { warehouseRoute } from './v1/warehouseRoute';
import { productRoute } from './v1/productRoute';
import { shopRoute } from './v1/shopRoute';
import { saleRoutes } from './v1/saleRoute';
import { dashboardRoutes } from './v1/dashboardRoute';
import { balanceSheetRoute } from './v1/balanceSheetRoute';
import { historyRoute } from './v1/historyRoute';

export const routes = [
    authRoute,
    categoryRoute,
    brandRoute,
    warehouseRoute,
    productRoute,
    shopRoute,
    saleRoutes,
    dashboardRoutes,
    balanceSheetRoute,
    historyRoute
]