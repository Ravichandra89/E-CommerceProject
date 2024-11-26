// src/types/express.d.ts
import * as express from 'express';
import { User } from '../models/User'; // Import the User interface or model

declare global {
  namespace Express {
    interface Request {
      user?: User; // or `user: User | null` if `user` can be null
    }
  }
}
