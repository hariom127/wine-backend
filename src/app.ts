import * as dotenv from 'dotenv'
import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import { NotFoundError } from './errors/not-fount-error'
import { errorHandler } from './middleware/error-handler'
import { routes } from './routes/index'
import cookieSession from 'cookie-session'
import cors from 'cors';
// import { RedisClient } from './lib/redis/RedisClient'
import { redisClient } from './lib/redis/RedisClient'

const result = dotenv.config();
if (result.error) {
  throw result.error
}
console.log(result.parsed)
const app = express()
app.use(cors())
app.set('trust proxy', true)
app.use(
  cookieSession({
    signed: false, //encruption false
    //cookie is only set for https connection
    secure: process.env.NODE_ENV !== 'test', //if NODE_ENV is test set secure:false
  }),
)
redisClient.init();

app.use(json());
app.use(routes);


//when route not found throw a error using NotFoundError class
app.all('*', async (req, res) => {
  console.log('Hello India *****************')
  throw new NotFoundError()
})
app.use(errorHandler)

export { app }
