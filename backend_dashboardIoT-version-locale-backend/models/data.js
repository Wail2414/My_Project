// Ici c'est un des models en question (les models c'est ce qu'il y a l'intérieur des tables dans la database PostgreSQL (on peut la voir dans pgAdmin))
// c'est la fonction exportée en question donc c'est la fonction exportée par le fichier data.js
module.exports = (sequelize, DataTypes) => {
  //tu définis un modèle Sequelize appelé Data qui sera mappé sur la table "Data" de la db du PostgreSQL (const Data = sequelize.define("Data",...))
  const Data = sequelize.define("Data", {
    // les champs de mon modèle "Data" en UML ce sont des attributs
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return Data;
};
