// require("dotenv").config();
const Sequelize = require('sequelize');
const sequelize = new Sequelize('table-tempo-server', 'postgres', 'password', {
    host: 'localhost',
    dialect: 'postgres'
});

sequelize.authenticate().then(
    function() {
        console.log('Connect to table-tempo-server postgres database');
    },
    function(err){
        console.log(err);
    }
);

Party = sequelize.import('./models/party.js');
Staff = sequelize.import('./models/staff.js');
Restaurant = sequelize.import('./models/restaurant.js');


Staff.belongsTo(Restaurant, {foreignKey: "restaurantId", targetKey: "id"});
Restaurant.hasMany(Staff);

Party.belongsTo(Staff);
Staff.hasMany(Party);


module.exports = sequelize;