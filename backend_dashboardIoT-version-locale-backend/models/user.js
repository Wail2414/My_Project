// models/user.js
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  User.beforeCreate(async (user, options) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
  });
  User.associate = (models) => {
    User.hasMany(models.Project, { foreignKey: "userId" }); //ici on lie user et project avec l'id de user
    User.hasMany(models.UserActivityLog, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    User.belongsToMany(models.Project, {
      through: models.ProjectUser,
      as: "sharedProjects",
      foreignKey: "userId",
      otherKey: "projectId",
    });
  };

  return User;
};
