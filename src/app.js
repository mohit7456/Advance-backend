const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const app = express()


//.use is used for middlewares and configuration setup generally.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))   // we use limit otherwise more data comes then our servers crashes possibly.(handling form data)
app.use(express.urlencoded({extended: true, limit: "16kb"}))  // Handling URL data.(extended used for , now we ccan define nested objects.)
app.use(express.static("public"))
app.use(cookieParser())

// routes import

const userRouter = require("./routes/user.routes.js")

// routes declaration
app.use("/api/v1/users", userRouter)     
// Here is parent url and it act as a middleware(.use) and what the flow goes like - it come to fisrt /users then move to 
// userrouter.js then check the child route which user requested(/register) then execute its controller in controller file.
// http://localhost:8000/api/v1/users/register

module.exports = { app }