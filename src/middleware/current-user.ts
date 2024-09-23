import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface UserPayload {
  id: string
  email: string
}

// tell TS add a optional currentUser property in Express-Request-Object
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("req.headers?.Authorization====", req.headers.authorization);
  if (!req.headers?.authorization) {
    return next()
  }

  try {
    const token = req.headers?.authorization.split(" ");
    const payload = jwt.verify(
      token[1],
      process.env.JWT_KEY!,
    ) as UserPayload
    console.log("token-payload==", payload);
    req.currentUser = payload
  } catch (error) {
    console.log("currentUser error===== ", error);
  }
  next()
}
