import { Request, Response, NextFunction } from 'express'
import { NotAuthorizedError } from '../errors/not-authorized-error'

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("req.url====>", req.url);
  console.log("req.method====>", req.method);
  console.log("req.body====>", req.body);
  console.log("req.params====>", req.params);

  if (!req?.currentUser) {
    throw new NotAuthorizedError()
  } else {
    next()
  }
}
