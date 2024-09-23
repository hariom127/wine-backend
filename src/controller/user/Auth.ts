import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { BadRequestError } from '../../errors/bad-request-error'
import { User } from '../../models/user'
import { HTTP_STATUS_CODE, Labels, MessagesEnglish } from '../../constant'
import { Password } from '../../services/password'
import { redisClient } from '../../lib/redis/RedisClient'
import { Brand, Shop, Warehouse } from '../../models'
import mongoose, { Types } from 'mongoose'
import { success } from '../../helpers/Response'
import logger from '../../lib/winston/logger';



const signup = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        //check existing user
        const { firstName, lastName, gender, email, countryCode, mobile, password, profileImg, city, state, pincode } = req.body as UserInterface.IUser;
        const existingUser = await User.findOne({
            $or: [
                { mobile: mobile },
                { email: email },
            ]
        }).session(session);

        if (existingUser) {
            throw new BadRequestError(MessagesEnglish.USER_ALREADY_EXIST)
        }

        const user = User.build({
            firstName,
            lastName,
            gender,
            email,
            countryCode,
            mobile,
            password,
            profileImg
        });
        await user.save({ session })

        const userId = user?._id as Types.ObjectId;

        const warehouse = Warehouse.build({
            name: "Warehouse",
            userId: userId,
            city: city,
            state: state,
            address: `${city} ${state}`,
            pincode: pincode,
            status: Labels.status.active,
        });
        await warehouse.save({ session });

        //Create first shop for this user
        const warehouseId = warehouse?._id as Types.ObjectId;

        const shop = Shop.build({
            "name": "Shop",
            "userId": userId,
            "warehouseId": warehouseId,
            "city": city,
            "state": state,
            "pincode": pincode,
            "address": `${city} ${state}`,
        });
        await shop.save({ session });
        let brands = await Brand.find({
            type: Labels.type.global,
            status: Labels.status.active,
        });

        let userBrands = brands.map(brand => {
            return {
                name: brand?.name,
                userId: userId,
                category: brand.category,
                description: brand?.description,
                packing: brand?.packing,
                MRP: brand?.MRP,
                qtyPerBox: brand?.qtyPerBox,
                ed: brand?.ed,
                aed: brand?.aed,
                warranty: brand?.warranty,
                image: brand?.image,
                type: Labels.type.personal,
                status: Labels.status.active,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
        await Brand.insertMany(userBrands, { session });
        await session.commitTransaction();
        session.endSession();
        delete (user as any).password;
        delete (user as any).createdAt;
        delete (user as any).updatedAt;
        delete (user as any).createdNum;
        const result = success(MessagesEnglish.SIGNUP_SUCCESS, user, HTTP_STATUS_CODE.CREATED)
        res.status(HTTP_STATUS_CODE.CREATED).send(result);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }

}

const login = async (req: Request, res: Response) => {
    try {
        //check existing user
        const { email, password } = req.body as UserInterface.IUserLogin;
        const userData = await User.findOne({
            email: email
        });
        if (!userData) {
            throw new BadRequestError(MessagesEnglish.USER_NOT_FOUND);
        }
        const isValid = await Password.compare(userData.password, password);

        if (!isValid) {
            throw new BadRequestError(MessagesEnglish.INVALID_EMAIL_OR_PASSWORD);
        }
        const warehouse = await Warehouse.findOne({ userId: userData?._id })

        // Return JWT token
        const token = jwt.sign({ id: userData.id, fullName: userData.fullName }, process.env.JWT_KEY!, {
            expiresIn: "1d",
        });
        const expTime = Date.now() + 1 * 24 * 60 * 60 * 1000;
        redisClient.set(`login:${userData.id}`, String(expTime))
        res.status(201).send({ userData, warehouseId: warehouse?._id, token });
    } catch (error) {
        logger.error(`Error in login method: ${error}`);
        throw error;
    }
}

export { signup, login }
