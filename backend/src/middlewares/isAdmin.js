export const isAdmin = (req, res, next) => {
  try {
    console.log("USER:", req.user); // debug

    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};