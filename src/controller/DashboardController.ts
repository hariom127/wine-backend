import { Request, Response } from 'express'
import { Product, Sale, Shop, ShopProduct } from '../models/index'
import { AppConstant, HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import { Types, PipelineStage } from 'mongoose';
import { getCurrentMonthStartAndEnd } from '../helpers/Common';

class DashboardController {
    async getSalesByShop(req: Request, res: Response) {
        try {
            const user = req.currentUser;
            let sales: any;
            let match: any = {
                userId: new Types.ObjectId(user?.id),
                status: Labels.status.active
            };
            const aggPipe = [];
            aggPipe.push({
                $match: match
            });
            aggPipe.push({
                $group: {
                    _id: "$shopId",
                    totalSale: { $sum: '$orderAmount' },
                    totalDiscount: { $sum: '$discount' },
                    totalQty: { $sum: '$qty' },
                    shopName: { $first: '$shopName' }
                }
            });

            aggPipe.push({
                $project: {
                    _id: 0,
                    shopId: '$_id',
                    shopName: 1,
                    totalSale: 1,
                    totalDiscount: 1,
                    totalQty: 1
                }
            });
            sales = await Sale.aggregate(aggPipe, {});
            const result = success(MessagesEnglish.SALES_RECEIVED, sales, HTTP_STATUS_CODE.OK);
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw error;
        }
    }


    /**
     * get sales by category
     */
    async getSalesByCategory(req: Request, res: Response) {
        try {
            const user = req.currentUser;
            let sales: any;
            let match: any = {
                userId: new Types.ObjectId(user?.id),
                status: Labels.status.active
            };
            const aggPipe = [];
            aggPipe.push({
                $match: match
            });
            aggPipe.push({
                $group: {
                    _id: "$category._id",
                    totalSale: { $sum: '$orderAmount' },
                    totalDiscount: { $sum: '$discount' },
                    totalQty: { $sum: '$qty' },
                    categoryName: { $first: '$category.name' }
                }
            });

            aggPipe.push({
                $project: {
                    _id: 0,
                    shopId: '$_id',
                    categoryName: 1,
                    totalSale: 1,
                    totalDiscount: 1,
                    totalQty: 1
                }
            });
            sales = await Sale.aggregate(aggPipe, {});
            const result = success(MessagesEnglish.SALES_RECEIVED, sales, HTTP_STATUS_CODE.OK);
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw error;
        }
    }


    /**
     * get sales by category
     */
    async getSalesByMonth(req: Request, res: Response) {
        try {
            const user = req.currentUser;
            const lastSixMonthsDate = new Date();
            lastSixMonthsDate.setMonth(lastSixMonthsDate.getMonth() - 6);

            const aggPipeline: PipelineStage[] = [
                {
                    $match: {
                        userId: new Types.ObjectId(user?.id),
                        status: Labels.status.active,
                        date: { $gte: lastSixMonthsDate }
                    }
                },
                {
                    $addFields: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    }
                },
                {
                    $group: {
                        _id: { year: "$year", month: "$month" },
                        totalSellingPrice: { $sum: "$orderAmount" }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                },
                {
                    $limit: 6
                },
                {
                    $project: {
                        _id: 0,
                        year: "$_id.year",
                        month: "$_id.month",
                        totalSellingPrice: 1,
                    }
                }
            ];
            const salesPromise = Sale.aggregate(aggPipeline);

            // Total revenue
            const revenuePromise = Sale.aggregate([
                {
                    $match: {
                        userId: new Types.ObjectId(user?.id),
                        status: Labels.status.active
                    }
                },
                {
                    $group: {
                        _id: "$userId",
                        totalSellingPrice: { $sum: "$orderAmount" }
                    }
                },
            ]);

            // Today's sale
            const { startOfMonthStart,
                endOfMonthEnd } = getCurrentMonthStartAndEnd();
            const thisMonthSalePromise = Sale.aggregate([
                {
                    $match: {
                        userId: new Types.ObjectId(user?.id),
                        dateNum: { $gte: startOfMonthStart.getTime(), $lte: endOfMonthEnd.getTime() },
                        status: Labels.status.active
                    }
                },
                {
                    $group: {
                        _id: "$userId",
                        totalSellingPrice: { $sum: "$orderAmount" }
                    }
                }
            ]);

            // warehouse short products count
            const shortProductsPromise = Product.countDocuments({ userId: new Types.ObjectId(user?.id), qty: { $lte: AppConstant.SHORT_QTY } });

            // shop outOfStock products count
            const shopsOutOfStockPromise = ShopProduct.countDocuments({ userId: new Types.ObjectId(user?.id), qty: { $lt: 1 } });


            // Run queries in parallel
            const [sales, revenue, warehouseShortProducts, thisMonthSale, shopOutOfStock] = await Promise.all([salesPromise, revenuePromise, shortProductsPromise, thisMonthSalePromise, shopsOutOfStockPromise]);
            const totalRevenue = revenue[0]?.totalSellingPrice || 0;
            const thisMonthSaleAmount = thisMonthSale[0]?.totalSellingPrice || 0;

            const result = success(MessagesEnglish.SALES_RECEIVED, { sales, totalRevenue, warehouseShortProducts, thisMonthSaleAmount, shopOutOfStock }, HTTP_STATUS_CODE.OK);
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw error;
        }
    }

}

export const dashboardController = new DashboardController();
