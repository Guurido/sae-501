import mongoose, { Schema } from "mongoose";
import validator from "validator";

import { isEmptyValidator } from "../validator.js";


const messageSchema = new Schema ({
    lastname: {
        type:String,
        required: [true, "Nom de famille requis"]
    },
    firstname: {
        type:String,
        required: [true, "Prénom requis"]
    },
    email:{
        type:String,
        required: [true, "E-mail requis"],
        validate: [validator.isEmail, "E-mail non valide"]
    },
    content: {
        type:String,
        required: [true, "Contenu requis"]
    },
    type:{
        type:String,
        enum: ["non_precise", "autre", "etudiant", "parent"],
        default: "autre"
    },
},
{
    timestamps: {
        createdAt: "created_at"
    },
}

);


messageSchema
    .path("firstname")
    .validate(
        isEmptyValidator,
        "Veuillez mettre un nom de famille, le champ ne peut pas être nul ou vide"
    );

messageSchema
    .path("lastname")
    .validate(
        isEmptyValidator,
        "Veuillez mettre un prénom, le champ ne peut pas être nul ou vide"
    );

messageSchema
    .path("email")
    .validate(
        isEmptyValidator,
        "Veuillez mettre un email, le champ ne peut pas être nul ou vide"
    ).validate(
        validator.isEmail,
        "Veuillez mettre un email valide"
    );

messageSchema
    .path("content")
    .validate(
        isEmptyValidator,
        "Veuillez mettre un contenu, le champ ne peut pas être nul ou vide"
    );

messageSchema
    .path("type")
    .validate(
        value => ["non_precise", "autre", "etudiant", "parent"].includes(value),
        "Type non valide, il doit être 'non_precise', 'autre', 'etudiant' ou 'parent'"
    );



export default mongoose.model("message", messageSchema)