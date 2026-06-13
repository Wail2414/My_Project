// ici on se trouve dans la connexion admin
const { User, UserActivityLog } = require("../models/db"); // Adjust the path to import from models/db ==> donc ici on import la db.js
const userActivityController = require("./userActivityController"); // on import
// creation de user
exports.createUser = async (req, res) => {
  try {
    //ici juste les admins peuvent créer des user
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).send({ message: "Access denied. Admins only." });
    }
    const { email, password, isAdmin } = req.body; // on recupere envoyé par le client genre ici c'est le admin qui crée le user
    const newUser = await User.create({ email, password: password, isAdmin }); // on crée le user dans la base de données
    await userActivityController.logActivity(
      req.user.userId,
      req.user.userEmail,
      "create", //actions
      `User created with email ${email}` //details
    ); // ici on logue l'activité genre qu'on a créé un user
    res
      .status(201)
      .send({ message: "User created successfully", user: newUser }); // message genre un user a été créé
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ message: "Internal server error" }); // si error
  }
};
// ici on recupere tous les users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    /*
    const users = await User.findAll({
      where: req.user.isAdmin ? {} : { isAdmin: false }, // ⚠️ Seuls les admins voient tout
    }); // il trouve les users dans la base de données*/
    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userInfo } = user.toJSON();
      return userInfo;
    }); //on recupere tous les users
    res.json(usersWithoutPasswords); // envoie de user sans le mdp
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "Internal server error" }); // si error
  }
};
// pour supprimer le user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // on recupere le id de user dans l'url
    //ici les users qui ne sont pas admin et les non users ne peuvent pas supprimer les autres
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).send({ message: "Access denied. Admins only." });
    }
    const user = await User.findByPk(id); // puis on le cherche dans la base de données l'ID
    // s'il n'y a pas user alors error (user not found)
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the user is an admin
    // ici user Admin ca empeche les autres users de le supprimer
    if (user.isAdmin) {
      const adminCount = await User.count({ where: { isAdmin: true } }); // ca compte cb de user admin y a

      // Prevent deletion if this is the last admin
      // s'il y en a 1 au moins alors tu ne peux pas supprimer l'admin user
      if (adminCount <= 1) {
        return res
          .status(400)
          .send({ message: "Cannot delete the last admin user" });
      }
    }

    await userActivityController.logActivity(
      req.user.userId,
      req.user.userEmail,
      "delete",
      `User deleted with email ${user.email}`
    ); //logue l'action de suppresion
    await user.destroy(); // ici ca supprime le user
    res.status(200).send({ message: "User deleted successfully" }); // donc envoie message que ca s'est supprimé le user
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ message: "Internal server error" }); // sinon  envoie message error
  }
};
//ici ca recupere tous les logues d'activités
exports.getUserActivityLogs = async (req, res) => {
  try {
    const logs = await UserActivityLog.findAll({
      order: [["timestamp", "DESC"]],
    }); // elle trouve tous les logues triés de plus recent au plus ancien
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    res.status(500).send({ message: "Internal server error" }); // sinon error
  }
};
