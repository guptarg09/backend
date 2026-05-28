import multer from "multer";


// It only PREPARES the upload system. It does not handle the actual upload. The actual upload is handled in the user.router.js where we use this middleware. This middleware will save the files in local storage and give us the path of the file, we will get the path of the file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({
  storage,
})

export { upload }