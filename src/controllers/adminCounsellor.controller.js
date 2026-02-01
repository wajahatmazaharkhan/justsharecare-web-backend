import { Counsellor } from "../models/Counsellor.models.js";
import { User } from "../models/User.models.js";

/* ================= GET ALL COUNSELLORS WITH USER ================= */
export const getAllCounsellors = async (req, res) => {
  try {
    const counsellors = await Counsellor.find()
      .populate("user_id", "fullname email role status")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: counsellors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= APPROVE COUNSELLOR ================= */
export const approveCounsellor = async (req, res) => {
  try {
    const { id } = req.params;

    const counsellor = await Counsellor.findByIdAndUpdate(
      id,
      { Admin_approved: true },
      { new: true }
    );

    if (!counsellor)
      return res.status(404).json({ message: "Counsellor not found" });

    await User.findByIdAndUpdate(counsellor.user_id, { isVerified: true });

    res.json({ success: true, message: "Counsellor Approved", counsellor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
