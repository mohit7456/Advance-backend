require('dotenv').config()  // Load all configuration of the project.

const connectDB = require("./db/index.js");    // Importing our mongoDB function here....

connectDB();


/*  NOrmal approach if we put all connection code in main file, but we put these all connection code in db folder for better distributing.

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