import 'dotenv/config'
import express from "express"
import path from "path";
import connectDB from "./config/dbConn.js"


connectDB()

const app = express();

const PORT = process.env.PORT || 3000



app.get('/', (req, res) => {
    res.send("Welcome to FitBuddy!");
});

app.get("/login", (req, res) => {
    res.send("Welcome to Login!");
})



app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
});



