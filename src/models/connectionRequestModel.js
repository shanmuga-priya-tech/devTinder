const mongoose = require("mongoose");

const connectionReqSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is invalid status`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//creating indexes
connectionReqSchema.index({ fromUserId: 1, toUserId: 1 });

const ConnectionReq = mongoose.model("ConnectionRequest", connectionReqSchema);
module.exports = ConnectionReq;
