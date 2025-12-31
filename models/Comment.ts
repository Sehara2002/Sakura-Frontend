import mongoose, { Schema, models } from "mongoose";

const CommentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    message: { type: String, required: true, trim: true, maxlength: 600 },
    page: { type: String, default: "general" }, // optional: track where they posted
  },
  { timestamps: true }
);

export const Comment = models.Comment || mongoose.model("Comment", CommentSchema);
