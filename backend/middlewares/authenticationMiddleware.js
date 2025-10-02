const jwt = require("jsonwebtoken");

const authenticationMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ message: "Authentication failed" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.email = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = authenticationMiddleware;
