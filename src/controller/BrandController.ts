import { Request, Response } from 'express'
import { HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import { baseController } from './BaseController';
import { AppService } from '../services/appService';
import { Types } from 'mongoose';
import { Brand } from '../models';
import { BadRequestError } from '../errors/bad-request-error';

class BrandController {
    async getBrands(req: Request, res: Response) {
        try {
            const currentUser = req.currentUser;
            const query: any = req.query;
            const match: any = {
                userId: new Types.ObjectId(currentUser?.id),
                status: Labels.status.active,
                type: { $ne: Labels.type.global }
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

            aggPipe.push({
                $sort: { _id: -1 }
            });

            const model = "Brand" as ModelNames;
            const brands = await baseController.paginate(model, aggPipe, query.limit, query.pageNo, {}, true);

            const result = success(MessagesEnglish.BRAND_RECEIVED, brands, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

    async getAllBrands(req: Request, res: Response) {
        try {
            const query: any = req.query;
            const currentUser = req.currentUser;
            let match: any = {
                userId: new Types.ObjectId(currentUser?.id),
                type: { $ne: Labels.type.global }
            };

            if (query.categoryId) {
                match["category._id"] = { $eq: new Types.ObjectId(query.categoryId) }
            }

            if (query.searchKey) {
                const search = AppService.escapeSpecialCharacter(query.searchKey);
                match.name = { $regex: search, $options: 'i' }
            }

            const model = "Brand" as ModelNames;
            const brands = await baseController.find(model, match, {}, {}, { name: 1 });

            const result = success(MessagesEnglish.BRAND_RECEIVED, brands, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            console.log(error);
            throw new BadRequestError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }

}

export const brandController = new BrandController();
