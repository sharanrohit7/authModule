import { Request, Response } from "express";
import {
  createAccountEmail,
  createAccountPhone,
  loginEmail,
  loginPhone,
} from "../services/account.service";

interface newUser {
  id: string;
  email?: string;
  password: string;
  phone?: string;
  role_id: string;
  sub_role_id: string;
}

const acceptedRole = ["1", "2", "3", "4", "5", "6"];

export const createAccount = async (req: Request, res: Response) => {
  try {
    const body: newUser = req.body;

    if (!body) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter the details" });
    }

    if (!acceptedRole.includes(body.role_id)) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid user role" });
    }

    body.id = crypto.randomUUID();

    console.log("Request body:", body);

    if (body.role_id === "3" || body.role_id === "6") {
      if (!body.phone) {
        return res
          .status(400)
          .json({ status: false, message: "Phone number is required" });
      }
      const response = await createAccountPhone(body);
      if (response.message) {
        return res
          .status(201)
          .json({ status: true, message: "Account created successfully" });
      } else {
        return res.status(400).json({ status: false, message: response.error });
      }
    } else {
      if (!body.email) {
        return res
          .status(400)
          .json({ status: false, message: "Email is required" });
      }
      const response = await createAccountEmail(body);
      if (response.user) {
        return res
          .status(201)
          .json({ status: true, message: "Account created successfully" });
      } else {
        return res.status(400).json({ status: false, message: response.error });
      }
    }
  } catch (error: any) {
    console.error("Error in createAccount:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

interface loginMobile {
  email?: string;
  phone?: string;
  password: string;
}
export const signIn = async (req: Request, res: Response) => {
  try {
    const body: loginMobile = req.body;
    if (body.email) {
      const data = {
        email: body.email,
        password: body.password,
      };
      const result = await loginEmail(data);
      if (result?.error) {
        return res.status(500).json({ status: false, data: result.error });
      }
      return res.status(200).json({ status: false, data: result });
    } else if (body.phone) {
      const data = {
        phone: body.phone,
        password: body.password,
      };
      const result = await loginPhone(data);
      if (result?.error) {
        return res.status(500).json({ status: false, data: result.error });
      }
      return res.status(200).json({ status: false, data: result });
    } else
      return res
        .status(401)
        .json({ status: false, message: "enter your details" });
  } catch (error) {
    console.log(error);

    return error;
  }
};
