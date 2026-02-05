const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const matchSchema = new Schema({
    users: [
        { type: Schema.Types.ObjectId, ref: "User", required: true }
    ],
    chatId: {
        type: Schema.Types.ObjectId,
        ref: "Chat" // optional: link to chat directly
    },
    matchedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one match per user pair
matchSchema.index({ users: 1 }, { unique: true });

const Match = model("Match", matchSchema);
module.exports = Match;
