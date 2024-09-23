import { Request, Response } from 'express'
import { Product, History, BalanceSheet, Shop } from '../models'
import { AppConstant, HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import { baseController } from './BaseController';
import { BadRequestError } from '../errors/bad-request-error';
import mongoose, { Types } from 'mongoose';
import { randomBytes } from 'crypto';

class ProductController {
    async getProducts(req: Request, res: Response) {
        try {
            const currentUser = req.currentUser;
            const query: any = req.query;
            const match: any = {
                status: Labels.status.active,
                userId: new Types.ObjectId(currentUser?.id),
            };
            if (query?.category) {
                match["category._id"] = {
                    $eq: new Types.ObjectId(query?.category),
                }
            }
            if (query?.search) {
                match.name = {
                    $regex: query?.search,
                    $options: "i" // Case insensitive
                }
            }
            const aggPipe = [];

            aggPipe.push({
                $match: match
            });

            if (Number(query.qtySort)) {
                aggPipe.push({ $sort: { qty: Number(query.qtySort) } });
            } else {
                aggPipe.push({ $sort: { createdAt: AppConstant.SORT.DESC } });
            }
            const model = "Product" as ModelNames;
            const products = await baseController.paginate(model, aggPipe, query.limit, query.pageNo, {}, true);

            const result = success(MessagesEnglish.PRODUCT_RECEIVED, products, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            console.log(error);
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    /**
     * Create warehouse product
     * @param req 
     * @param res 
     */
    async createProduct(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { name, category, brandId, warehouseId, packing, MRP, purchasePrice, sellingPrice, boxQty = 0, looseQty = 0, qtyPerBox, shopId } = req.body as ProductInterface.ICreateProduct;
            const currentUser = req.currentUser;
            const qty = (boxQty * qtyPerBox) + looseQty;

            const shop = await Shop.findById({ _id: new Types.ObjectId(shopId) })

            const product = Product.build({
                name,
                userId: currentUser?.id,
                shopId,
                shopName: String(shop?.name),
                warehouseId,
                brandId,
                category,
                packing,
                MRP,
                purchasePrice,
                sellingPrice,
                qty,
                qtyPerBox
            })
            const data = await product.save({ session });
            // Create history
            const historyData = {
                name,
                userId: currentUser?.id,
                productId: data._id as Types.ObjectId,
                brandId,
                shopId,
                warehouseId,
                category,
                packing,
                MRP,
                purchasePrice,
                sellingPrice,
                qty,
                qtyPerBox,
                image: product?.image,
                from: Labels.transferStage.depo,
                to: Labels.transferStage.warehouse
            };
            const history = History.build(historyData);
            history.save({ session });

            //Create balance sheet
            const lastSheetRecord = await BalanceSheet.findOne({ userId: new Types.ObjectId(currentUser?.id), status: Labels.status.active }, {},).sort({ createdAt: -1 });

            const availableBalance = lastSheetRecord?.balance || 0;
            const amount = (purchasePrice * qty);
            const balance = availableBalance - amount;

            const sheetData = {
                note: Labels.balanceSheetNote.warehouseProductPurchase,
                userId: new Types.ObjectId(currentUser?.id),
                entityId: data._id as Types.ObjectId,
                entityType: "Product",
                qty,
                qtyPerBox,
                amount: amount,
                balance: balance,
                tag: Labels.tag.purchase,
                transactionType: Labels.transactionType.debit,
                date: new Date()
            };
            const balanceSheet = BalanceSheet.build(sheetData);
            await balanceSheet.save({ session });

            await session.commitTransaction();
            session.endSession();
            const result = success(MessagesEnglish.PRODUCT_CREATED, data, HTTP_STATUS_CODE.CREATED)
            res.status(HTTP_STATUS_CODE.CREATED).send(result);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async deleteProduct(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { id } = req.params;
            const currentUser = req.currentUser;
            const product = await Product.findById(new Types.ObjectId(id));

            if (!product) {
                return Promise.reject(new BadRequestError(MessagesEnglish.INVALID_PRODUCT_ID))
            }

            if (String(product?.userId) !== String(currentUser?.id)) {
                return Promise.reject(new BadRequestError(MessagesEnglish.PRODUCT_NOT_BELONGS_TO_YOU));
            }
            product.status = Labels.status.deleted;
            await product.save({ session });

            // Create history
            const historyData = {
                name: product.name,
                userId: currentUser?.id,
                productId: product._id as Types.ObjectId,
                brandId: product?.brandId,
                shopId: product?.shopId,
                warehouseId: product?.warehouseId,
                category: product?.category,
                packing: product?.packing,
                MRP: product?.MRP,
                purchasePrice: product?.purchasePrice,
                sellingPrice: product?.sellingPrice,
                qty: product?.qty,
                qtyPerBox: product?.qtyPerBox,
                image: product?.image,
                from: Labels.transferStage.warehouse,
                to: Labels.transferStage.depo
            };
            const history = History.build(historyData);
            history.save({ session });

            // Create balance sheet
            const lastSheetRecord = await BalanceSheet.findOne({ userId: new Types.ObjectId(currentUser?.id), status: Labels.status.active }, {},).sort({ createdAt: -1 });
            const amount = (product?.purchasePrice * product?.qty);
            const availableBalance = lastSheetRecord?.balance || 0;
            const balance = availableBalance - amount;

            const sheetData = {
                note: Labels.balanceSheetNote.warehouseProductPurchaseDelete,
                userId: new Types.ObjectId(currentUser?.id),
                entityId: product._id as Types.ObjectId,
                entityType: "Product",
                qty: product?.qty,
                qtyPerBox: product?.qtyPerBox,
                amount: amount,
                balance: balance,
                tag: Labels.tag.return,
                transactionType: Labels.transactionType.credit,
                date: new Date()
            };
            const balanceSheet = BalanceSheet.build(sheetData);
            await balanceSheet.save({ session });

            await session.commitTransaction();
            session.endSession();
            const result = success(MessagesEnglish.PRODUCT_DELETED, {}, HTTP_STATUS_CODE.OK);
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async updateQty(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { id } = req.params;
            const { qty } = req.body;
            const currentUser = req.currentUser;
            const product = await Product.findById(new Types.ObjectId(id)).session(session);

            if (!product) {
                return Promise.reject(new BadRequestError(MessagesEnglish.INVALID_PRODUCT_ID))
            }

            if (String(product?.userId) !== String(currentUser?.id)) {
                return Promise.reject(new BadRequestError(MessagesEnglish.PRODUCT_NOT_BELONGS_TO_YOU))
            }

            const finalQty = -(Number(product.qty) - Number(qty));

            if ((finalQty + Number(product.qty)) < 0) {
                throw new BadRequestError(MessagesEnglish.QTY_UPDATE_NOT_ALLOWED);
            }

            await Product.updateOne(
                { _id: new Types.ObjectId(id) },
                { $inc: { qty: finalQty } },
                { session }
            );

            // Create history
            const productData = {
                category: product?.category,
                productId: product?._id as Types.ObjectId,
                shopId: product.shopId,
                name: product?.name,
                brandId: product?.brandId,
                warehouseId: product?.warehouseId,
                userId: product?.userId,
                packing: product?.packing,
                MRP: product?.MRP,
                purchasePrice: product?.purchasePrice,
                sellingPrice: product?.sellingPrice,
                image: product?.image,
                qty: finalQty,
                qtyPerBox: product?.qtyPerBox,
            }
            const history = await History.build({
                ...productData,
                from: Labels.transferStage.depo,
                to: Labels.transferStage.warehouse
            });
            await history.save({ session });

            //Create balance sheet
            const lastSheetRecord = await BalanceSheet.findOne({ userId: new Types.ObjectId(currentUser?.id), status: Labels.status.active }, {},).sort({ createdAt: -1 }).session(session);

            const availableBalance = lastSheetRecord?.balance || 0;
            let amount;
            let balance;
            let note;
            let transactionType;

            if (finalQty < 0) {
                amount = (product?.purchasePrice * Math.abs(finalQty));
                balance = Number(availableBalance) + Number(amount);
                note = Labels.balanceSheetNote.warehouseProductQtyDecrease;
                transactionType = Labels.transactionType.credit;
            } else {
                amount = (product?.purchasePrice * Math.abs(finalQty));
                balance = Number(availableBalance) - Number(amount);
                note = Labels.balanceSheetNote.warehouseProductQtyIncrease;
                transactionType = Labels.transactionType.debit;
            }

            const sheetData = {
                note: note,
                userId: new Types.ObjectId(currentUser?.id),
                entityId: product._id as Types.ObjectId,
                entityType: "Product",
                qty: finalQty,
                qtyPerBox: product.qtyPerBox,
                amount: amount,
                balance: balance,
                tag: Labels.tag.purchase,
                transactionType: transactionType,
                date: new Date()
            };
            const balanceSheet = BalanceSheet.build(sheetData);
            await balanceSheet.save({ session });

            await session.commitTransaction();
            session.endSession();

            const result = success(MessagesEnglish.QTY_UPDATED, {}, HTTP_STATUS_CODE.UPDATED);
            res.status(HTTP_STATUS_CODE.UPDATED).send(result);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

export const productController = new ProductController();
