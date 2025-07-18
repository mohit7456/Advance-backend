// When user click on upload button then it browse this functionality is handled by fontend.
// Now our working start that how we take the file from user and send to our server and stored it on server temporarily.
// For this we us Multer.

const multer = require("multer")


const storage = multer.diskStorage({
    destination: function (req, file, cb) {                     //cb => Callback, Now see starting we have two option (req,res,cb)
      cb(null, "./public/temp")                                // But now we have one more option "file" using multer.
    },
    filename: function (req, file, cb) {
      //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)   --> It isused for giving UNIQUE name to file.
      //cb(null, file.fieldname + '-' + uniqueSuffix)
      cb(null, file.originalname)           // original name is those the name given by user.
    }
  })
  
const upload = multer({                   // Calling multer , upper one is function.
  storage,
})
module.exports = { upload }