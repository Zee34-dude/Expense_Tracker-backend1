import { auth } from "../config/firebase.js";

 const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing Authorization header" });
  // console.log(header)
  const token = header.split(" ")[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded; // decoded.uid, decoded.email, etc.
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
export default verifyToken