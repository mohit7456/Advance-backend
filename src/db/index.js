// WHat we have to here......first we write our connection code here and then export it and then import it on our main index.js file.

const mongoose = require("mongoose")
const { DB_NAME } = require("../constants.js")

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // we store our connection into connectionInstance because further we use connectionInstance.connection.host which return our 
        // whole databse URl and we confirm from here that we are connected with which host, whether it is - prod, dev, bets etc..
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error ", error);
        // Here now we exit with exit() command
        process.exit(1)
    }
    
}

module.exports = connectDB;