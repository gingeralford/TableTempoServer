require("dotenv").config();
let express = require('express');
let app = express();
let sequelize = require('./db');

let restaurant = require('./controllers/restaurantcontroller');
let staff = require('./controllers/staffcontroller');
let party = require('./controllers/partycontroller');

sequelize.sync();
// sequelize.sync({ force: true })  
app.use(require('./middleware/headers'));
 
app.use(express.json());

app.use('/test', function(req, res){ 
    res.send('This is a message from the Table Tempo test server!')
})

app.use('/restaurant', restaurant);
app.use('/staff', staff);
app.use('/party', party);

app.listen(process.env.PORT, () => {
    console.log(`Table Tempo is listening on port ${process.env.PORT}`)
}) 