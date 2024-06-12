import { Request, Response } from "express"
import { createAccountEmail, createAccountPhone } from "../services/account.service";

interface newUser{
    id: string,
    email?: string,
    password: string,
    phone?: string,
    role_id : string,
    sub_role_id: string
}

const acceptedRole = ["1","2","3","4","5","6"];


export const createAccount = async (req: Request, res: Response) => {
    try {
      const body: newUser = req.body;
  
      if (!body) {
        return res.status(400).json({ status: false, message: "Please enter the details" });
      }
  
      if (!acceptedRole.includes(body.role_id)) {
        return res.status(401).json({ status: false, message: "Invalid user role" });
      }
  
      body.id = crypto.randomUUID();
  
      console.log("Request body:", body);
  
      if (body.role_id === '3' || body.role_id === '6') {
        const response = await createAccountPhone(body);
        if (response.message) {
          return res.status(201).json({ status: true, message: "Account created successfully" });
        } else {
          return res.status(400).json({ status: false, message: response.error });
        }
      } else {
        const response = await createAccountEmail(body);
        if (response.user) {
          return res.status(201).json({ status: true, message: "Account created successfully"});
        } else {
          return res.status(400).json({ status: false, message: response.error });
        }
      }
  
    } catch (error: any) {
      console.error("Error in createAccount:", error);
      return res.status(500).json({ status: false, message: error.message });
    }
  };