import express, { Request, Response, response } from "express"
import { createAccount, signIn } from "../controller/account.controller"
import { loginPhone } from "../services/account.service"

const router = express.Router()

router.post("/create",createAccount)
router.post("/login",signIn)

export default router