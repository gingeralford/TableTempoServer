module.exports = function (sequelize, DataTypes) {
    const Party = sequelize.define("party", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        partyNum: {
            type:DataTypes.INTEGER,
            allowNull: false
        },
        telephone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        over21:{
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        timeArrived:{
            type: DataTypes.DATE,
            allowNull: false
        },
        timeEstimated:{
            type: DataTypes.DATE,
            allowNull: false
        },
        timeSeated: {
            type: DataTypes.DATE,
            allowNull: true
        },
        seated: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        leftUnseated: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        specialNotes: {
            type: DataTypes.STRING,
            allowNull: true
        },
        staffId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        restaurantId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    return Party
};