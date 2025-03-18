module.exports = {
  // ✅ Ensure user is logged in (required for both Users & Admins)
  checkIfAuthorized: function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please log in." });
    }
    if (req.user.role === "Admin" || req.user.role === "User") {
      return next();
    }
    return res.status(403).json({ message: "Forbidden: Insufficient permissions." });
  },

  // ✅ Ensure only Admins can access a route
  checkIfAdmin: function (req, res, next) {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Forbidden: Admin access only." });
    }
    return next();
  },

  // ✅ Allow users to view their own details, or Admins to view any user
  canSeeUserDetails: function (req, res, next) {
    if (req.user) {
      if (req.user.role === "Admin" || req.user.id == req.params.userId) {
        return next();
      }
    }
    return res.status(302).redirect("/auth/login"); // Redirect to login instead of failing silently
  },

  // ✅ Allow only Admins to view the list of all users
  canSeeUserList: function (req, res, next) {
    if (req.user && req.user.role === "Admin") {
      return next();
    }
    return res.status(302).redirect("/auth/login"); // Redirect instead of sending an error
  },
};
