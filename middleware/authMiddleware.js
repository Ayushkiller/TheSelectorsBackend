const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Authenticating request...");

  // Get token from header
  const authHeader = req.header("Authorization");

  // Check if no auth header
  if (!authHeader) {
    console.log("No Authorization header found");
    return res
      .status(401)
      .json({ message: "No Authorization header, authentication denied" });
  }

  // Check if the Authorization header has the correct format
  if (!authHeader.startsWith("Bearer ")) {
    console.log("Invalid Authorization header format");
    return res
      .status(401)
      .json({ message: "Invalid Authorization header format" });
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  // Check if no token
  if (!token) {
    console.log("No token found in Authorization header");
    return res
      .status(401)
      .json({ message: "No token found, authentication denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded.user;
    console.log("Token verified successfully");
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (err.name === "JsonWebTokenError") {
      console.log("MONGO_URI:", process.env.MONGO_URI);
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
      console.log("Invalid token");
      return res.status(401).json({ message: "Invalid token" });
    } else {
      return res.status(401).json({ message: "Token verification failed" });
    }
  }
};

module.exports = authMiddleware;
