import { Request, Response } from 'express'
import { Sale, Shop, ShopProduct, History, BalanceSheet } from '../models/index'
import { AppConstant, HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import mongoose, { Types } from 'mongoose';
import { BadRequestError } from '../errors/bad-request-error';
import { baseController } from './BaseController';

class SaleController {

    async addSale(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { shopId, boxQty = 0, looseQty = 0, productId, sellingPrice, date, discount = 0 } = req.body;
            const currentUser = req.currentUser;

            const product = await ShopProduct.findOne({ _id: new Types.ObjectId(productId), shopId: new Types.ObjectId(shopId) }).session(session);
            if (!product) {
                return Promise.reject(new BadRequestError(MessagesEnglish.INVALID_PRODUCT_ID))
            }

            const shop = await Shop.findById({ _id: new Types.ObjectId(shopId) }, { name: 1 }).session(session);
            if (!shop) {
                return Promise.reject(new BadRequestError(MessagesEnglish.SHOP_NOT_FOUND));
            }
            const totalQtySale = (boxQty * product.qtyPerBox) + looseQty;

            if (product.qty < totalQtySale) {
                return Promise.reject(new BadRequestError(`Sorry only ${product.qty} qty available`))
            }
            //minus sell qty from available qty of shop-products
            await ShopProduct.updateOne({ _id: new Types.ObjectId(productId) }, { $inc: { qty: -totalQtySale } }, { session });

            const amount = (sellingPrice * totalQtySale);
            const productData = {
                name: product?.name,
                category: product?.category,
                productId: product?._id as string,
                shopId: shopId,
                shopName: shop?.name!,
                brandId: product?.brandId,
                warehouseId: product?.warehouseId,
                userId: product?.userId,
                packing: product?.packing,
                MRP: product?.MRP,
                purchasePrice: product?.purchasePrice,
                sellingPrice: sellingPrice,
                discount: discount,
                orderAmount: amount,
                image: product?.image,
                qty: totalQtySale,
                qtyPerBox: product?.qtyPerBox,
                date: new Date(date),
                dateNum: date
            }

            // create sale entry
            const sell = Sale.build(productData);
            await sell.save({ session });


            //create history
            const historyData = {
                name: product?.name,
                userId: currentUser?.id,
                saleId: sell._id as Types.ObjectId,
                productId: new Types.ObjectId(product.productId),
                brandId: product.brandId,
                shopId,
                warehouseId: product.warehouseId,
                category: product.category,
                packing: product?.packing,
                MRP: product.MRP,
                purchasePrice: product.purchasePrice,
                sellingPrice: sellingPrice,
                qty: totalQtySale,
                qtyPerBox: product.qtyPerBox,
                image: product?.image,
                from: Labels.transferStage.shop,
                to: Labels.transferStage.customer
            };
            const history = History.build(historyData);
            history.save({ session });

            //Create balance sheet
            const lastSheetRecord = await BalanceSheet.findOne({ userId: new Types.ObjectId(currentUser?.id), status: Labels.status.active }, {},).sort({ createdAt: -1 }).session(session);

            const availableBalance = lastSheetRecord?.balance || 0;
            const balance = Number(availableBalance) + Number(amount);

            const sheetData = {
                note: Labels.balanceSheetNote.shopProductSale,
                userId: new Types.ObjectId(currentUser?.id),
                entityId: sell._id as Types.ObjectId,
                entityType: "Sale",
                qty: totalQtySale,
                qtyPerBox: product.qtyPerBox,
                amount: amount,
                balance: balance,
                tag: Labels.tag.sale,
                transactionType: Labels.transactionType.credit,
                date: new Date()
            };
            const balanceSheet = BalanceSheet.build(sheetData);
            await balanceSheet.save({ session });

            await session.commitTransaction();
            session.endSession();
            const result = success(MessagesEnglish.SAVE_SUCCESSFULLY, {}, HTTP_STATUS_CODE.CREATED)
            res.status(HTTP_STATUS_CODE.CREATED).send(result);
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            session.endSession();
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async getSales(req: Request, res: Response) {
        try {
            const currentUser = req.currentUser;
            const query: any = req.query;
            const { category, shop, search, fromDate, toDate } = query;
            let match: any = {
                userId: new Types.ObjectId(currentUser?.id),
                status: Labels.status.active
            };
            if (shop) {
                match["shopId"] = new Types.ObjectId(shop);
            }
            if (category) {
                match["category._id"] = new Types.ObjectId(category);
            }
            if (search) {
                match.name = {
                    $regex: search,
                    $options: "i" // Case insensitive
                }
            }
            const dateFilter = await baseController.buildDateCondition(fromDate, toDate)
            if (Object.keys(dateFilter)) {
                match = { ...match, ...dateFilter };
            }
            const aggPipe = [];

            aggPipe.push({
                $match: match
            });
            aggPipe.push({ $sort: { createdAt: AppConstant.SORT.DESC } });
            const model = "Sale" as ModelNames;
            const sales = await baseController.paginate(model, aggPipe, query.limit, query.pageNo, {}, true);

            const result = success(MessagesEnglish.SALES_RECEIVED, sales, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async deleteSales(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const currentUser = req.currentUser;
            const params: any = req.params;
            const { id } = params;

            const sale = await Sale.findById(id);
            if (!sale) {
                throw new BadRequestError(MessagesEnglish.INVALID_ID)
            }
            sale.status = Labels.status.deleted;
            await sale.save({ session });

            // Revert sale qty to shop
            await ShopProduct.updateOne({ _id: new Types.ObjectId(sale?.productId), shopId: sale.shopId }, { $inc: { qty: sale?.qty } }, { session });

            // Update balance sheet
            const lastSheetRecord = await BalanceSheet.findOne({ userId: new Types.ObjectId(currentUser?.id), status: Labels.status.active }, {},).sort({ createdAt: -1 }).session(session);

            const availableBalance = lastSheetRecord?.balance || 0;
            const balance = Number(availableBalance) - Number(sale?.orderAmount);

            const sheetData = {
                note: Labels.balanceSheetNote.shopProductSaleRevert,
                userId: new Types.ObjectId(currentUser?.id),
                entityId: sale._id as Types.ObjectId,
                entityType: "Sale",
                qty: sale?.qty,
                qtyPerBox: sale?.qtyPerBox,
                amount: sale?.orderAmount,
                balance: balance,
                tag: Labels.tag.sale,
                transactionType: Labels.transactionType.debit,
                date: new Date()
            };
            const balanceSheet = BalanceSheet.build(sheetData)
            await balanceSheet.save({ session })

            //create history
            const historyData = {
                name: sale?.name,
                userId: currentUser?.id,
                saleId: sale._id as Types.ObjectId,
                productId: new Types.ObjectId(sale.productId),
                brandId: sale.brandId,
                shopId: sale?.shopId,
                warehouseId: sale.warehouseId,
                category: sale.category,
                packing: sale?.packing,
                MRP: sale.MRP,
                purchasePrice: sale.purchasePrice,
                sellingPrice: sale?.sellingPrice,
                qty: sale?.qty,
                qtyPerBox: sale.qtyPerBox,
                image: sale?.image,
                from: Labels.transferStage.customer,
                to: Labels.transferStage.shop,
            };
            const history = History.build(historyData);
            await history.save({ session });

            await session.commitTransaction();
            session.endSession();
            const result = success(MessagesEnglish.SALE_DELETED, {}, HTTP_STATUS_CODE.OK);
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

}

export const saleController = new SaleController();
