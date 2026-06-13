const jwt = require("jsonwebtoken");
const { User } = require("../models/db"); // pour aller chercher l'utilisateur complet
const secretKey = "your_secret_key";

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(401)
      .send({ message: "Access token is missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    // On récupère le user depuis la DB
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // On ajoute les infos complètes dans req.user
    req.user = {
      userId: user.id,
      userEmail: user.email,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(403).send({ message: "Invalid token" });
  }
};

module.exports = authenticateToken;
