import path from "path";
import multer from "multer";
import fs from "fs/promises";

import { imageValidator } from "#database/validator.js";

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
}); 

const upload = multer({ storage })

export default upload;

const uploadImage = (image, dist_dir) => {
    let targetPath = undefined;
    const listErrors = []
    const error = imageValidator(image);
       
    if(error !== null) {
        listErrors.push(error)
    } else {
        targetPath = `${dist_dir}${image.filename}`;
        const tempPath = image.path;

        fs.copyFile(tempPath, targetPath).then().catch((err) => {
            listErrors.push(err)
        })
    }

    return { image_path: targetPath, errors: listErrors, image_name: image.filename }
}

const deleteUpload = (path) => {
    if(!path) return []
    const listErrors = []
    fs.unlink(path).then().catch((err) => {
        listErrors.push(err)
    })

    return listErrors
}

export { uploadImage, deleteUpload }
