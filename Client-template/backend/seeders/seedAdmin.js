// seedAdmin.js
const { sequelize, User } = require("../models/db");
const bcrypt = require("bcryptjs");
// on déclare la fct admin
const seedAdmin = async () => {
  const adminEmail = "admin@example.com";
  const adminPassword = "admin"; //"admin";
  const isAdmin = true; // ces données faut les faire dans un fichier .env + sécurisé
  // ici on voit si les tables ont été bien  créé avec sync()
  try {
    await sequelize.sync();
    // puis là on verifie si l'admin existe dans laquelle findOrCreate cherche un user avec les infos d'admin sinon il va le créer
    const [admin, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        email: adminEmail,
        password: adminPassword,
        isAdmin: isAdmin,
      },
    });
    // si créé alors admin user a été créé avec un message
    if (created) {
      console.log(`Admin user created with email: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists with email: ${adminEmail}`); // sinon error
    }
  } catch (error) {
    console.error("Error seeding admin user:", error); // error ici aussi
  }
};
module.exports = seedAdmin; // on l'export
