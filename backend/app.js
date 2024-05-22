import express from "express"
import cookieParser from "cookie-parser";


const app = express();
app.use(express.static("public"))
app.use(express.json());
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'



//routes declaration
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register

export { app }