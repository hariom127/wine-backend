import express, { Request, Response } from 'express'
import { Category } from '../models/category'
import { HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../constant';
import { success } from '../helpers/Response';
import { InternalServerError } from '../errors/internal-server-error';
import * as models from "../models";
var _ = require('lodash');
import { ClientSession, PipelineStage } from 'mongoose';
import { BadRequestError } from '../errors/bad-request-error';

class BaseController {

    async find(model: ModelNames, query: any, projection: { [key: string]: number }, options = {}, sort?: { [key: string]: number }, paginate?: { pageNo: number, limit: number }, populateQuery?: any, session?: ClientSession) {
        try {
            const ModelName: any = models[model];
            options = { ...options, lean: true, session }; // Add session to options

            let queryBuilder = ModelName.find(query, projection, options);

            if (!_.isEmpty(sort)) {
                queryBuilder = queryBuilder.sort(sort);
            }

            if (!_.isEmpty(paginate)) {
                queryBuilder = queryBuilder.skip((paginate.pageNo - 1) * paginate?.limit).limit(paginate?.limit);
            }

            if (!_.isEmpty(populateQuery)) {
                queryBuilder = queryBuilder.populate(populateQuery);
            }

            return await queryBuilder.exec();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    paginate = async (model: ModelNames, pipeline: any[], limit: number, pageNo: number, options: any = {}, pageCount = false) => {
        try {
            pipeline = [...pipeline, ...this.addSkipLimit(limit, pageNo)];
            let ModelName = models[model];

            let promiseAll = [];
            if (!_.isEmpty(options)) {
                if (options.collation) {
                    promiseAll = [
                        ModelName.aggregate(pipeline).collation({ "locale": "en" }).allowDiskUse(true)
                    ];
                } else {
                    promiseAll = [
                        ModelName.aggregate(pipeline).allowDiskUse(true)
                    ];
                }
            } else {
                promiseAll = [
                    ModelName.aggregate(pipeline).allowDiskUse(true)
                ];
            }

            if (pageCount) {

                for (let index = 0; index < pipeline.length; index++) {
                    if ("$skip" in pipeline[index]) {
                        pipeline = pipeline.slice(0, index);
                    } else {
                        // pipeline = pipeline;
                    }
                }
                pipeline.push({ "$count": "total" });
                promiseAll.push(ModelName.aggregate(pipeline).allowDiskUse(true));
            }
            let result = await Promise.all(promiseAll);

            let nextHit = 0;
            let total = 0;
            let totalPage = 0;

            if (pageCount) {

                total = result[1] && result[1][0] ? result[1][0]["total"] : 0;
                totalPage = Math.ceil(total / limit);
            }

            let data: any = result[0];
            if (result[0].length > limit) {
                nextHit = pageNo + 1;
                data = result[0].slice(0, limit);
            }
            return {
                "data": data,
                "total": total,
                "pageNo": pageNo,
                "totalPage": totalPage,
                "nextHit": nextHit,
                "limit": limit
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * @description Add skip and limit to pipeline
     */
    addSkipLimit = (limit: number, pageNo: number) => {
        if (limit) {
            limit = Math.abs(limit);
            // If limit exceeds max limit
            if (limit > 100) {
                limit = 100;
            }
        } else {
            limit = 10;
        }
        if (pageNo && (pageNo !== 0)) {
            pageNo = Math.abs(pageNo);
        } else {
            pageNo = 1;
        }
        let skip = (limit * (pageNo - 1));
        return [
            { "$skip": skip },
            { "$limit": limit + 1 }
        ];
    }

    async buildDateCondition(fromDate: string, toDate: string) {
        try {
            const startDate = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
            const endDate = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

            if ((startDate && endDate) && endDate < startDate) {
                // return Promise.reject(MessagesEnglish.TO_DATE_CAN_NOT_LESS);
                throw new BadRequestError(MessagesEnglish.TO_DATE_CAN_NOT_LESS)
            }
            // Build the match query
            const matchQuery: any = {};
            if (startDate) {
                matchQuery.dateNum = { $gte: startDate };
            }
            if (endDate) {
                matchQuery.dateNum = { ...matchQuery.dateNum, $lte: endDate };
            }
            return matchQuery;
        } catch (error) {
            throw error;
        }

    }

}

export const baseController = new BaseController();
