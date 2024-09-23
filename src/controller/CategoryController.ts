import express, { Request, Response } from 'express'
import { Category } from '../models/category'
import { HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import { InternalServerError } from '../errors/internal-server-error';
import { baseController } from './BaseController';

class CategoryController {
    async getCategories(req: Request, res: Response) {
        try {
            const { pageNo, limit, pagination, search, category } = req.query;
            let categories: any;
            if (pagination) {
                const query: any = {
                    status: Labels.status.active,
                }
                categories = await baseController.paginate("Category", [{
                    $match: query
                }], Number(limit), Number(pageNo), {}, true);
            } else {
                const query: any = {
                    status: Labels.status.active
                }
                categories = await Category.find(query);
            }
            const result = success(MessagesEnglish.CATEGORIES_RECEIVED, categories, HTTP_STATUS_CODE.OK)
            res.status(HTTP_STATUS_CODE.OK).send(result);
        } catch (error) {
            console.log("err======", error);

            throw new InternalServerError(MessagesEnglish.SOMETHING_WENT_WRONG)
        }
    }


}

export const categoryController = new CategoryController();
