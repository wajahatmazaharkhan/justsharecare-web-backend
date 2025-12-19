import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
   
    user_id: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: true,
       index: true
     },
   
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
    //   enum: ["email", "sms", "push", "in-app"], // Common notification channels
    //   default: "in-app",
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    meta: {
     // type: mongoose.Schema.Types.Mixed, // Flexible JSON storage
      type: String ,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: "notifications",
  }
);


export const Notification = mongoose.model("Notification", NotificationSchema);
