import express, { Request, Response, json } from 'express';
// import chatRouter from '../src/routes/testRoute/test.chat';
import helmet from "helmet";
import cors from "cors";
import { signToken } from './services/token.service';
import { tokenMiddleware } from './middleware/token.middle';
const app = express();


app.use(helmet())
app.use(cors)
// app.use(chatRouter)



// const res = signToken("rohit","1")
// console.log(res);
// app.use(tokenMiddleware);

app.get('/hello',(req: Request, res:Response) => {
 return res.send('Hello, World!');
});

export { app };