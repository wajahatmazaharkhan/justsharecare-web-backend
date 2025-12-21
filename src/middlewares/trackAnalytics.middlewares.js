import { PageAnalytics } from "../models/PageAnalytics.model.js";

export const trackAnalytics = async (req, res, next) => {
  try {
    const url = req.originalUrl;

    // 🚫 Excluded routes
    const excludedRoutes = [
      "/api/user/login",
      "/api/user/signup",
      "/analytics/track",
      "/favicon.ico",
    ];

    if (url.startsWith("/admin") || excludedRoutes.includes(url)) {
      return next();
    }

    await PageAnalytics.create({
      page: url,
      userId: req.user?.id || null,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.log("❌ Analytics Error:", error.message);
  }

  next();
};
