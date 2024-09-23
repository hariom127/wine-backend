/**
 * Abstact class define signature only for chield class
 * chield class must be impliment property and menthod defined in abstract class with there return type.
 */

export abstract class CustomError extends Error {
  abstract statusCode: number
  constructor(message: string) {
    //calling super() calling Error base class instance like
    //==> throw new  Error('error msg')
    /**
     * 'this' and 'super' both are used to make constructor calls. super() is used to call Base class's constructor(i.e, Parent's class) while this() is used to call the current class's constructor
     */
    super(message)

    //just because we extending build in class
    Object.setPrototypeOf(this, CustomError.prototype)
  }

  abstract serializeErrors(): { message: string; field?: string }[]
}
