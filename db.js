// require("dotenv").config();
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require:true,
            rejectUnauthorized:false,
        }
    }
});

sequelize.authenticate().then(
    function() {
        console.log('Connect to table-tempo-server postgres database');
    },
    function(err){
        console.log(err);
    }
);

const Party = sequelize.import('./models/party');
const Staff = sequelize.import('./models/staff');
const Restaurant = sequelize.import('./models/restaurant');

//{foreignKey: "uniqueCode", targetKey: "uniqueCode"}
Staff.belongsTo(Restaurant);
Restaurant.hasMany(Staff);

Party.belongsTo(Staff);
Staff.hasMany(Party);


module.exports = sequelize;