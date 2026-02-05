const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const swipeSchema = new Schema({
    fromUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    action: {
        type: String,
        enum: ["like", "dislike"],
        required: true
    }
}, { timestamps: true });

// Ensure a user can swipe only once per other user
swipeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

const Swipe = model("Swipe", swipeSchema);
module.exports = Swipe;
