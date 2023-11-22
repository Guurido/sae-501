import mongoose, { Schema } from "mongoose";

const commentArticleSchema = new Schema(
    {
        content: {
            type: String,
            required: [
                true,
                "Veuillez mettre un commentaire, le champ ne peut pas être nul ou vide",
            ],
            trim: true,
        },
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Article",
            required: true,
        },
    },
    {
        timestamps: { createdAt: "created_at" },
    }
);

commentArticleSchema.methods.getClean = function () {
    const res = {
        _id: this._id,
        content: this.content,
        article: this.article._id,
        created_at: this.created_at,
        updatedAt: this.updatedAt,
        __v: this.__v,
    };

    return res;
};

export default mongoose.model("CommentArticle", commentArticleSchema);
