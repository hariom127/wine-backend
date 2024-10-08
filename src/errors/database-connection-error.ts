import { CustomError } from './custom-error'

export class DatabaseConnectionError extends CustomError {
  statusCode = 500
  reasons = 'Error connecting to database'
  constructor() {
    super('Error connecting to database')
    //just because we extending build in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
  }

  serializeErrors() {
    return [{ message: this.reasons }]
  }
}
