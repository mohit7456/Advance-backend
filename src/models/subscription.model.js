const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId,         // subcriber bhi toh user he h toh voh bhi user model se he aenge
            ref: "User"
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,         // channel bhi user he banaega toh voh bhi user model se he aenge
            ref: "User"
        }
        
    },
    { timestamps: true }
)

const Subscription = mongoose.model("Subscription", subscriptionSchema)

module.exports = Subscription