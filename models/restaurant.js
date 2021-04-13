module.exports = function (sequelize, DataTypes) {
    const Restaurant = sequelize.define('restaurant', {
        restaurantName:{
            type: DataTypes.STRING,
            allowNull: false
        },
        email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password:{
            type: DataTypes.STRING,
            allowNull: false
        },
        uniqueCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
    return Restaurant;
}