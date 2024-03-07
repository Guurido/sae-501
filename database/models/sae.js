import mongoose, { Schema } from "mongoose";
import { isEmptyValidator, isBelowLengthValidator } from '../validator.js'

const saeSchema = new Schema({
    title: {
        type: String,
        required: [
            true,
            "Veuillez mettre un titre, le champ ne peut pas être nul ou vide",
        ],
        trim: true,
    },
    content: {
        type: String,
        maxlength: [
            200,
            'Le champ "contenu" ne peut pas dépasser 200 caractères'
        ],
        trim: true,
    },
    image: String,
});

saeSchema.path("title").validate(isEmptyValidator, "Veuillez mettre un titre, le champ ne peut pas être nul ou vide")
saeSchema.path("content").validate((val) => isBelowLengthValidator(val, 200), 'Le champ content ne peut pas dépasser 200 caractères')

saeSchema.pre("findOneAndUpdate", function (next) {
    this.options.runValidators = true;
    next();
});

export default mongoose.model("SAE", saeSchema);
