// Simply working of Cloudinary is that taking the path(as a parameter) of the uploaded file which are temporary stored on server and 
// after taking the path, store it in own(cloudinary) database.Then on successfull completion, unlink the file with the server.       
// SERVER ----> Cloudinary Database = Working of Cloudinary, 
// FRONTEND --> SERVER = Working of MULTER


const cloudinary = require('cloudinary').v2;
const fs = require("fs")

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    
    try {
        // Checking parameter is empty or not.
        if (!localFilePath) return null;

        // Upload the file on cloudinary
    // Response contains all the parameters of uploaded file on cloudinary like -size, height, url(Public-url = accessible by user) etc
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"                          // It can be anything - image, video, raw, auto(automatically detects.)
            })

            // Now at this point file is upload is successfull.
            console.log("file is upload on Cloudinary ", response.url);
            return response;
            
    } catch (error) {
        fs.unlink(localFilePath) // remove the saved temporary file as the upload operation got failed on server.
    }
    
}

module.exports = uploadOnCloudinary