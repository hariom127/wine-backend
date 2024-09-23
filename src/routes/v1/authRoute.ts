import express from 'express'
import { body } from 'express-validator'
import { validateRequest } from '../../middleware/validate-req'
import { signup, login } from '../../controller/user/Auth'
import { Labels } from '../../constant'
const router = express.Router()

router.post(
  '/api/v1/users/signup',
  [
    body('firstName').isString().isLength({ min: 3, max: 40 }).withMessage('Provide a valid first name !'),
    body('lastName').isString().isLength({ min: 3, max: 40 }).withMessage('Provide a valid last name !'),
    body('profileImg').isString().withMessage('Provide a valid profile !'),
    body('gender').isString().isIn([Labels.gender.Male, Labels.gender.Female, Labels.gender.Other]).withMessage('Provide a valid gender !'),

    body('countryCode').isString().isLength({ min: 2, max: 4 }).withMessage('Provide a valid country code !'),
    body('mobile').trim().isString().isLength({ min: 10, max: 10 }).withMessage('Provide a valid mobile !'),
    body('email').trim().isString().isEmail().withMessage('Provide a valid email !'),
    body('password').trim().isString().isLength({ min: 8, max: 50 }).withMessage('Provide a valid password !'),
    body('city').trim().isString().isLength({ min: 2, max: 50 }),
    body('state').trim().isString().isLength({ min: 2, max: 50 }),
    body('pincode').trim().isString().isLength({ min: 6, max: 6 }),
  ],
  validateRequest,
  signup
)

router.post(
  '/api/v1/users/login',
  [
    body('email').trim().isString().isEmail().withMessage('Provide a valid email !'),
    body('password').trim().isString().isLength({ min: 8, max: 50 }).withMessage('Provide a valid password !'),
  ],
  validateRequest,
  login
)

router.post('/api/v1/users/logout', (req, res) => {
  req.session = null
  res.clearCookie('session');
  console.log("======logout======");
  res.send({})
})

export { router as authRoute }
