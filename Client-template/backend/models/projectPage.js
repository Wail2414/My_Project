// models/ProjectPage.js
module.exports = (sequelize, DataTypes) => {
    const ProjectPage = sequelize.define('ProjectPage', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        projectId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        page: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        droppedItems: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    });
    return ProjectPage;
};
