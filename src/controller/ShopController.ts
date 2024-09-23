import { Request, Response } from 'express'
import { HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import { baseController } from './BaseController';
import { BadRequestError } from '../errors/bad-request-error';
import { Product, Shop, ShopProduct, History } from '../models';
import mongoose, { Types } from 'mongoose';

class ShopController {

    async getShops(req: Request, res: Response) {
        try {
            const currentUser = req.currentUser;
            const query: any = req.query;
            const match: any = {
                userId: new Types.ObjectId(currentUser?.id),
                status: Labels.status.active
            };
            const aggPipe = [];

            aggPipe.push({
                $match: match
            });

            aggPipe.push({
                $sort: { createdAt: -1 }
            });

            const model = "Shop" as ModelNames;
            const shops = await baseController.paginate(model, aggPipe, query.limit, query.pageNo, {}, true);

            const result = success(MessagesEnglish.SHOP_RECEIVED, shops, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async getShopDetails(req: Request, res: Response) {
        try {
            const params: any = req.params;
            const currentUser = req.currentUser;

            const match: any = {
                _id: params.id,
                userId: new Types.ObjectId(currentUser?.id),
                status: { $ne: Labels.status.deleted }
            };
            const shop = await Shop.findOne(match, {}, {});

            const totalProduct = await ShopProduct.countDocuments({ shopId: params.id, status: { $ne: Labels.status.deleted } });

            const inStock = await ShopProduct.countDocuments({ shopId: params.id, qty: { $gt: 0 }, status: { $ne: Labels.status.deleted } });

            const outOfStock = await ShopProduct.countDocuments({ shopId: params.id, qty: { $lt: 1 }, status: { $ne: Labels.status.deleted } });

            const result = success(MessagesEnglish.SHOP_RECEIVED, { shop: shop, totalProduct, inStock, outOfStock }, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }


    async getShopProducts(req: Request, res: Response) {
        try {
            const query: any = req.query;
            const params: any = req.params;
            const match: any = {
                shopId: new Types.ObjectId(params?.id),
                status: Labels.status.active
            };
            if (query.category) {
                match["category._id"] = { $eq: new Types.ObjectId(query.category) }
            }
            if (query?.search) {
                match.name = {
                    $regex: query.search,
                    $options: "i" // Case insensitive
                }
            }
            const aggPipe = [];

            aggPipe.push({
                $match: match
            });
            if (Number(query?.qtySort)) {
                aggPipe.push({
                    $sort: { qty: Number(query?.qtySort) }
                });
            } else {
                aggPipe.push({
                    $sort: { createdAt: -1 }
                });
            }

            const model = "ShopProduct" as ModelNames;
            const shops = await baseController.paginate(model, aggPipe, query.limit, query.pageNo, {}, true);

            const result = success(MessagesEnglish.SHOP_RECEIVED, shops, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            console.log("error-----", error);

            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async importProduct(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { boxQty = 0, looseQty = 0, productId } = req.body;
            const params: any = req.params;

            //Warehouse product
            const product = await Product.findById({ _id: new Types.ObjectId(productId) }).session(session);
            if (!product) {
                throw new BadRequestError(MessagesEnglish.INVALID_PRODUCT_ID)
            }

            const productBoxQty = Math.floor(product.qty / product.qtyPerBox);
            const productLooseQty = Math.floor(product.qty % product.qtyPerBox);
            const qtyPerBox = product.qtyPerBox || 0;

            if (boxQty && (productBoxQty < boxQty)) {
                throw new BadRequestError(MessagesEnglish.BOX_QTY_EXCEED)
            }
            if (looseQty && (productLooseQty < looseQty)) {
                throw new BadRequestError(MessagesEnglish.LOOSE_QTY_EXCEED)
            }
            // mines the qty
            const totalQty = (Number(boxQty) * Number(qtyPerBox)) + Number(looseQty);
            if (totalQty <= 0) {
                throw new BadRequestError(MessagesEnglish.QTY_MUST_BE_GRATER_THEN_ZERO);
            }
            await Product.updateOne({ _id: new Types.ObjectId(productId) }, { $inc: { qty: -totalQty } }, { session });

            let shopProduct: any;
            // Check if product already exist
            shopProduct = await ShopProduct.findOne({ shopId: params.id, productId: new Types.ObjectId(productId), purchasePrice: product?.purchasePrice });
            if (shopProduct) {
                await ShopProduct.updateOne({ _id: shopProduct?._id }, { $inc: { qty: totalQty } });
            } else {
                // else create new product for shop
                const productData = {
                    category: product?.category,
                    productId: product?._id as string,
                    shopId: params.id,
                    name: product?.name,
                    brandId: product?.brandId,
                    warehouseId: product?.warehouseId,
                    userId: product?.userId,
                    packing: product?.packing,
                    MRP: product?.MRP,
                    purchasePrice: product?.purchasePrice,
                    sellingPrice: product?.sellingPrice,
                    image: product?.image,
                    qty: totalQty,
                    qtyPerBox: product?.qtyPerBox,
                }
                // save qty in shop product
                shopProduct = await ShopProduct.build(productData);
                await shopProduct.save({ session });
            }

            // create history for it
            const history = await History.build({
                shopProductId: shopProduct?._id as Types.ObjectId,
                category: product?.category,
                productId: product?._id as Types.ObjectId,
                shopId: params.id,
                name: product?.name,
                brandId: product?.brandId,
                warehouseId: product?.warehouseId,
                userId: product?.userId,
                packing: product?.packing,
                MRP: product?.MRP,
                purchasePrice: product?.purchasePrice,
                sellingPrice: product?.sellingPrice,
                image: product?.image,
                qty: totalQty,
                qtyPerBox: product?.qtyPerBox,
                from: Labels.transferStage.warehouse,
                to: Labels.transferStage.shop
            });
            await history.save({ session });

            await session.commitTransaction();
            session.endSession();
            const result = success(MessagesEnglish.SHOP_RECEIVED, {}, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            session.endSession();
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async updateQty(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { shopId, productId } = req.params;
            const { qty } = req.body;
            const params: any = req.params;

            const product = await ShopProduct.findById({ _id: new Types.ObjectId(productId) }).session(session);
            if (!product) {
                throw new BadRequestError(MessagesEnglish.INVALID_PRODUCT_ID)
            }
            if (String(product?.shopId) !== String(shopId)) {
                throw new BadRequestError(MessagesEnglish.PRODUCT_NOT_BELONGS_TO_YOU)
            }
            console.log("product=====", product);
            const finalQty = -(Number(product.qty) - Number(qty));

            await ShopProduct.updateOne(
                { _id: new Types.ObjectId(productId) },
                { $inc: { qty: finalQty } },
                { session }
            );

            const productData = {
                category: product?.category,
                productId: product?._id as Types.ObjectId,
                shopId: params.id,
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

            // create history for it
            const history = await History.build({
                ...productData,
                from: Labels.transferStage.warehouse,
                to: Labels.transferStage.shop
            });
            await history.save({ session });

            await session.commitTransaction();
            session.endSession();
            const result = success(MessagesEnglish.SHOP_RECEIVED, {}, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            session.endSession();
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async updateShop(req: Request, res: Response) {
        try {
            const { id } = req.params!;
            const { name, address, state, city, pincode } = req.body!;
            const shop = await Shop.findOne({ _id: new Types.ObjectId(id), status: { $ne: Labels.status.deleted } });

            if (!shop) {
                return Promise.reject(new BadRequestError(MessagesEnglish.INVALID_SHOP_ID))
            }
            shop.name = name;
            shop.address = address;
            shop.state = state;
            shop.city = city;
            shop.pincode = pincode;
            shop.save();

            const result = success(MessagesEnglish.SHOP_UPDATED, {}, HTTP_STATUS_CODE.UPDATED)
            return res.status(HTTP_STATUS_CODE.UPDATED).send(result);
        } catch (error) {
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG);
        }
    }
}

export const shopController = new ShopController();
