const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { ACCESS_SECRET } = require("../config/jwt");

const userAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    try {
      // verify access token
      const decoded = jwt.verify(accessToken, ACCESS_SECRET);

      // attach minimal data (no DB hit every request)
      req.userId = decoded._id;
      return next();
    } catch (err) {
      // important: detect expiry separately
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "TOKEN_EXPIRED" });
      }

      return res.status(403).json({ message: "INVALID_TOKEN" });
    }
  } catch (error) {
    res.status(500).json({ message: "AUTH_ERROR" });
  }
};

module.exports = { userAuth };
