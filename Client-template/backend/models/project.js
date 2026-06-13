module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("Project", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lastModified: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
  Project.associate = (models) => {
    Project.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    Project.belongsToMany(models.User, {
      through: models.ProjectUser,
      as: "sharedUsers",
      foreignKey: "projectId",
      otherKey: "userId",
    });
  };

  return Project;
};
