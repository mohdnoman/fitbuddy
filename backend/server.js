import express from "express"
const app = express();

const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, "public")))

app.get('/', (req, res) => {
    res.send("Welcome to FitBuddy!");
});

app.get("/login", (req, res) => {
    res.send("Welcome to Login!");
})



app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
});



