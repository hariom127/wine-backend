import express, { Request, Response } from 'express'
import { Product, Warehouse } from '../models/index'
import { HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import { InternalServerError } from '../errors/internal-server-error';
import { Types } from 'mongoose';
import { BadRequestError } from '../errors/bad-request-error';

class WarehouseController {

    async getWarehouse(req: Request, res: Response) {
        try {
            const currentUser = req.currentUser!;
            const query: any = {
                userId: { $eq: new Types.ObjectId(currentUser.id) },
                status: { $eq: Labels.status.active }
            }
            const warehouse: any = await Warehouse.findOne(query);

            //get counts
            const inStockProduct = await Product.countDocuments({ warehouseId: warehouse._id, qty: { $gte: 1 } })
            const totalProduct = await Product.countDocuments({ warehouseId: warehouse._id })
            const outOfStockProduct = await Product.countDocuments({ warehouseId: warehouse._id, qty: { $lte: 0 } })

            const data = {
                warehouse,
                totalProduct,
                inStockProduct,
                outOfStockProduct
            }
            const result = success(MessagesEnglish.WAREHOUSE_RECEIVED, data, HTTP_STATUS_CODE.OK)
            return res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw new InternalServerError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async updateWarehouse(req: Request, res: Response) {
        try {
            const { id } = req.params!;
            const { name, address, state, city, pincode } = req.body!;
            const warehouse = await Warehouse.findOne({ _id: new Types.ObjectId(id), status: { $ne: Labels.status.deleted } });

            if (!warehouse) {
                return Promise.reject(new BadRequestError(MessagesEnglish.INVALID_WAREHOUSE_ID))
            }
            warehouse.name = name;
            warehouse.address = address;
            warehouse.state = state;
            warehouse.city = city;
            warehouse.pincode = pincode;
            warehouse.save();

            const result = success(MessagesEnglish.WAREHOUSE_UPDATED, {}, HTTP_STATUS_CODE.UPDATED)
            return res.status(HTTP_STATUS_CODE.UPDATED).send(result);
        } catch (error) {
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }


}

export const warehouseController = new WarehouseController();
