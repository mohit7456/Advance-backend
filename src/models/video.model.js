const mongoose = require("mongoose")
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,        // Cloudinary field
            required: true
        },
        thumbnail: {
            type: String,       // Cloudinary field
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {               // Duration give by cloudinary that how much video is long.
            type: Number,
            required: true
        },
        view: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,            // Foreign key
            ref: "User"                                    
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)