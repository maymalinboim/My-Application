import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = "images/";
        
        if (req.baseUrl.includes("users")) {
            uploadPath = "images/users/";
        } else if (req.baseUrl.includes("posts")) {
            uploadPath = "images/posts/";
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueFilename = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueFilename);
    },
});

const upload = multer({ storage });

export default upload;
