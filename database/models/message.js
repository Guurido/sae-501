import mongoose, { Schema } from "mongoose";
import validator from "validator";

const messageSchema = new Schema({
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
    content: String,
    type: {
        type: String,
        enum: ["non_précise", "autre", "etudiant", "parent"],
        default: ["non_précise"]
    }
})

{
    timestamps: true;
}

//test

export default mongoose.model("Message", messageSchema);