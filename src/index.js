require('dotenv').config()  // Load all configuration of the project.

const connectDB = require("./db/index.js");    // Importing our mongoDB function here....
const { app } = require("./app.js")

connectDB()                                   // Now it is async so it always return promise we need to handle it laso.
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log(("Mongo db connection failed !!! ", err));
    
})

/*  NOrmal approach if we put all connection code in main file, but we put these all connection code in db folder for better distributing.
    process is used it have current process refrence in it.

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/$
        {DB_NAME}`)

        app.on("error", (error) => {
            console.log("Databse is connected but exprees not able to talk with it.", error)
            throw error                             // exiting with by throwing this error. 
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on ${process.env.PORT}`);
            
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})()  // ()() ---> Immediate invoke function --> we are usign ifi(instant execution when server starts.)
*/