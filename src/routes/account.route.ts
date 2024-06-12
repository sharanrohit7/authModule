import express from "express"
import { createAccount } from "../controller/account.controller"

const router = express.Router()

router.post("/create",createAccount)

export default router