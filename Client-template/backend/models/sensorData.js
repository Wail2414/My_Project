module.exports = (sequelize, DataTypes) => {
  const SensorData = sequelize.define(
    "SensorData",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "sensor_data",
      timestamps: false,
    }
  );

  return SensorData;
};
