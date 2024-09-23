import { Request, Response } from 'express'
import { BalanceSheet } from '../models/index'
import { AppConstant, HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import { Types } from 'mongoose';
import { BadRequestError } from '../errors/bad-request-error';
import { baseController } from './BaseController';

class BalanceSheetController {

    async getBalanceSheet(req: Request, res: Response) {
        try {
            const query: any = req.query;
            const currentUser = req.currentUser;
            const { transactionType, tag, search, fromDate, toDate, pageNo = 1, limit = 10 } = query;
            let match: any = {
                userId: new Types.ObjectId(currentUser?.id),
                status: Labels.status.active
            };
            const dateFilter = await baseController.buildDateCondition(fromDate, toDate);
            if (Object.keys(dateFilter)) {
                match = { ...match, ...dateFilter };
            }
            if (transactionType) {
                match["transactionType"] = transactionType;
            }
            if (tag) {
                match["tag"] = tag;
            }
            if (search) {
                match.note = {
                    $regex: search,
                    $options: "i" // Case insensitive
                }
            }
            const aggPipe = [];
            aggPipe.push({
                $match: match
            });
            aggPipe.push({ $sort: { createdAt: AppConstant.SORT.DESC } });
            const model = "BalanceSheet" as ModelNames;
            const sheet = await baseController.paginate(model, aggPipe, limit, pageNo, {}, true);

            //Get available balance
            const lastSheetRecord = await BalanceSheet.findOne({ userId: new Types.ObjectId(currentUser?.id), status: Labels.status.active }, {},).sort({ createdAt: -1 });
            const availableBalance = lastSheetRecord?.balance || 0;

            const result = success(MessagesEnglish.BALANCE_SHEET, { availableBalance, sheet }, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async createBalanceSheet(req: Request, res: Response) {
        try {
            const data = req.body;
            const currentUser = req.currentUser;

            const lastSheetRecord = await BalanceSheet.findOne({ userId: new Types.ObjectId(currentUser?.id), status: Labels.status.active }, {},).sort({ createdAt: -1 });

            const availableBalance = lastSheetRecord?.balance || 0;
            let balance;
            if (data.transactionType === Labels.transactionType.credit) {
                balance = availableBalance + Math.abs(data.amount);
            } else {
                balance = availableBalance - Math.abs(data.amount);
            }

            const balanceSheet = BalanceSheet.build({
                userId: new Types.ObjectId(currentUser?.id),
                note: data.note,
                transactionType: data.transactionType,
                tag: data.tag,
                amount: data.amount,
                balance,
                date: data.date,
            });
            await balanceSheet.save();
            const result = success(MessagesEnglish.CREATED_SUCCESSFULLY, balanceSheet, HTTP_STATUS_CODE.CREATED)
            res.status(HTTP_STATUS_CODE.CREATED).send(result);
        } catch (error) {
            throw error;
        }
    }
}

export const balanceSheetController = new BalanceSheetController();
