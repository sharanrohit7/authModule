import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token.service';

export const tokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).json({ error: "Token not provided" });
  }

  const verificationResponse = await verifyToken(token);
  // console.log(verificationResponse);

  if (verificationResponse === "Token not found") {
    return res.status(400).json({ error: "Token not found" });
  }

  if (verificationResponse === "Invalid token") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (verificationResponse === "Token not provided") {
    return res.status(400).json({ error: "Token not provided" });
  }

  if (typeof verificationResponse === 'string') {
    return res.status(500).json({ error: verificationResponse });
  }

  next();
};
