module.exports = function (sequelize, DataTypes) {
    const Staff = sequelize.define("staff", {
        uniqueCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // restaurantId: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password:{
            type: DataTypes.STRING,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    });
    return Staff
};