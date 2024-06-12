import express, { Request, Response, json } from 'express';
// import chatRouter from '../src/routes/testRoute/test.chat';
import helmet from "helmet";
import cors from "cors";
import { signToken } from './services/token.service';
import accountRouter from "./routes/account.route"
import { tokenMiddleware } from './middleware/token.middle';
const app = express();

app.use(express.json())
app.use(helmet())
app.use(cors())
app.use("/api",accountRouter)



// const res = signToken("rohit","1")
// console.log(res);
// app.use(tokenMiddleware);

app.get('/hello',tokenMiddleware,(req: Request, res:Response) => {
   return res.send('Hello, World!');
});

export { app };