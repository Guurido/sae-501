import mongoose, { Schema } from "mongoose";
import validator from "validator";

const jpoSchema = new Schema({
    name: {
        type: String,
        required: [true, "Nom requis"]
    },
    date: {
        type: String,
        required: [true, "Date requis"]
    }
})

{
    timestamps: true;
}

export default mongoose.model("JPO", jpoSchema);