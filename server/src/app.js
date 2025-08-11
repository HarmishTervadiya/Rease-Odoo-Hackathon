import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));


// Routes Imports
import userRouter from './routes/user.routes.js'
import productRouter from './routes/product.routes.js'


app.use('/api/v1/users', userRouter);
app.use('/api/v1/product', productRouter);

app.get("/healthcheck", (req, res)=> {
  res.send("Successfully connected")
})


export { app };
