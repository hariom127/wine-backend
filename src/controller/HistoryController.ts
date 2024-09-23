import { Request, Response } from 'express'
import { BalanceSheet, Product, Warehouse } from '../models/index'
import { AppConstant, HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import { InternalServerError } from '../errors/internal-server-error';
import { Types } from 'mongoose';
import { BadRequestError } from '../errors/bad-request-error';
import { baseController } from './BaseController';

class HistoryController {

    async getHistory(req: Request, res: Response) {
        try {
            const query: any = req.query;
            const currentUser = req.currentUser;
            const { fromDate, toDate, pageNo = 1, limit = 10 } = query;
            let match: any = {
                userId: new Types.ObjectId(currentUser?.id),
                status: Labels.status.active
            };
            const dateFilter = await baseController.buildDateCondition(fromDate, toDate);
            if (Object.keys(dateFilter)) {
                match = { ...match, ...dateFilter };
            }

            const aggPipe = [];
            aggPipe.push({
                $match: match
            });
            aggPipe.push({
                $project: { updatedAt: 0, createdNum: 0, __v: 0, category: 0, description: 0, brandId: 0, productId: 0, warehouseId: 0, purchasePrice: 0, sellingPrice: 0, qtyPerBox: 0 }
            })
            aggPipe.push({ $sort: { createdAt: AppConstant.SORT.DESC } });
            const model = "History" as ModelNames;
            const history = await baseController.paginate(model, aggPipe, limit, pageNo, {}, true);

            const result = success(MessagesEnglish.HISTORY_RECEIVED, history, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw error
        }
    }
}

export const historyController = new HistoryController();
