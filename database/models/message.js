import mongoose, { Schema } from "mongoose";
import validator from "validator";

const messageSchem = new Schema({
    lastname: {
        type: String,
        required: [true, "Nom de famille requis"]
    },
    firstname: {
        type: String,
        required: [true, "Prénom requis"]
    },
    email: {
        type: String,
        required: [true, "E-mail requis"],
        validate: [validator.isEmail, "E-mail non valide"]
    },
    content: {
        type: String,
        required: [true, "Message requis"]
    },
    type: {
        type: String,
        enum: ["non_précise", "autre", "etudiant", "parent"],
        default: ["non_précise"]
    }
})

export default mongoose.model("Message", messageSchema);