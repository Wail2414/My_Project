// models/db/alertLog.js
module.exports = (sequelize, DataTypes) => {
    const AlertLog = sequelize.define('AlertLog', {
      topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    });
  
    // Associations (if any) can be defined here
    // AlertLog.associate = (models) => {
    //   // Example association
    //   AlertLog.belongsTo(models.User, { foreignKey: 'userId' });
    // };
  
    return AlertLog;
  };