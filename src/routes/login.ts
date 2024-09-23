import express from 'express'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validate-req'
import { login } from '../controller/user/Auth'
const router = express.Router()



router.post(
    '/api/v1/users/login',
    [
        body('email').trim().isString().isEmail().withMessage('Provide a valid email !'),
        body('password').trim().isString().isLength({ min: 8, max: 50 }).withMessage('Provide a valied mobile !'),
    ],
    validateRequest,
    login
)



export { router as loginRouter }
