module.exports = (sequelize, DataTypes) => {
  const ProjectUser = sequelize.define("ProjectUser", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return ProjectUser;
};
