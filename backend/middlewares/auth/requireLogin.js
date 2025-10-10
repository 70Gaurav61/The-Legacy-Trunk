export const requireLogin = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "Login required to access this resource" });
  next();
};
