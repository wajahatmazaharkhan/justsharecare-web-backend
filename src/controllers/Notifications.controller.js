import { Notification } from "../models/Notifications.model.js";

export const createNotification = async (req, res) => {
  try {
    const { title, body, channel, type, meta } = req.body;
    console.log(req.user._id, req.user.userId);
    const notification = await Notification.create({
      userId: req.user.userId,
      title,
      body,
      channel,
      type,
      meta,
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to create notification" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const query = { userId: req.user.userId };

    // Optional filtering
    if (req.query.type) {
      query.type = req.query.type;
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });

    res.json({ result: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notification" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

//optional
export const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.userId });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};
