import mongoose from "mongoose";

const appointmentsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    counsellor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counsellor",
      required: true,
      index: true,
    },

    scheduled_at: {
      type: Date,
      required: true,
    },

    duration_minutes: {
      type: Number,
      required: true,
    },

    session_type: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },

    price: {
      type: Number,
      required: true,
    },

    payment_id: {
      type: String,
    },

    zego_session_id: {
      type: String,
    },

    notes: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

appointmentsSchema.index({ counsellor_id: 1, scheduled_at: 1 });
appointmentsSchema.index({ user_id: 1, scheduled_at: 1 });

// appointmentsSchema.pre(/^find/, function (next) {
//   this.where({ is_deleted: false });
//   next();
// });

appointmentsSchema.pre(["find", "findOne"], function () {
  this.where({ is_deleted: false });
});

export const Appointment = mongoose.model("Appointment", appointmentsSchema);
