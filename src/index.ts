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

  // const port = process.env.PORT || 3000;
  // app.listen(port, () => {
  //   console.log('listening on port 3000!!!!!!!')
  // })

  const port: number = Number(process.env.PORT) || 80;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}
start()
