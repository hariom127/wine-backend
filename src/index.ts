import { connect, set } from 'mongoose'
import { app } from './app'

const start = async () => {
  try {
    if (!process.env.JWT_KEY) {
      throw new Error('JWT Key must be defined!')
    }
    if (!process.env.MONGO_URI) {
      throw new Error('Mongo uri Key must be defined!')
    }
    set('debug', true);
    const db = await connect(process.env.MONGO_URI).then(() => {
      console.log('Connected to MongoDB');
    }).catch((err) => {
      console.error('Error connecting to MongoDB:', err);
    });





  } catch (err) {
    console.error(err)
  }

  app.listen(3000, () => {
    console.log('listening on port 3000!!!!!!!')
  })
}
start()
