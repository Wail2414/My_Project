// models/db/userActivityLog.js
module.exports = (sequelize, DataTypes) => {
  const UserActivityLog = sequelize.define("UserActivityLog", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
  //on Delete: "CASCADE" ca supprime les logs de user pour pouvoir effacer user
  UserActivityLog.associate = (models) => {
    UserActivityLog.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };

  return UserActivityLog;
};
