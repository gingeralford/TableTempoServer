const router = require('express').Router();
const Restaurant = require('../db').import('../models/restaurant');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
//Maybe don't need validateSession at all in this file.
// let validateSessionRest = require('../middleware/validateSessionRest');

router.get('/practice', function(req, res){
    res.send('Hey This is a practice route for restaurant');
})

//CREATE A RESTAURANT - restaurant/create
router.post('/create', function (req, res) {
    Restaurant.create({
        restaurantName:req.body.restaurant.restaurantName,
        email: req.body.restaurant.email,
        password: bcrypt.hashSync(req.body.restaurant.password, 10),
        uniqueCode : uuidv4()
        //auto-generates a random code on creation, not needed in request from client side
    })
    .then(
        function successfulCreation(restaurant) {
            let token = jwt.sign({id: restaurant.id, uniqueCode: restaurant.uniqueCode}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
            
            res.status(200).json({
                restaurant: restaurant,
                message: "Restaurant created successfully",
                sessionToken: token
            })
        }     
    )
    .catch(err => res.status(500).json({error:err}))
})
// example request:
// {
//     "restaurant" : {
//         "restaurantName": "Jurassic Fork",
//         "email": "jerry@pawnee.gov",
//         "password": "painting"
//     }
// }



//RESTAURANT LOGIN - restaurant/login
router.post('/login', function (req, res) {
    Restaurant.findOne({where:{email:req.body.restaurant.email}})
    .then(
        function successfulLogin(restaurant) {
            if(restaurant){
                bcrypt.compare(req.body.restaurant.password, restaurant.password, function(err, matches){
                    if(matches){
                        let token = jwt.sign({id: restaurant.id, uniqueCode: restaurant.uniqueCode}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
                        
                        res.status(200).json({
                            restaurant: restaurant,
                            message: "Restaurant has logged in successfully",
                            sessionToken: token
                        })
                    } else { 
                        res.status(502).send({error: "Failed Login"});
                    }            
            });
            } else {
                res.status(500).send("No restaurant found")
            }
        })
    .catch(err => res.status(500).json({error: err}))
});
// example request:
// {
//     "restaurant" : {
//         "email": "jerry@pawnee.gov",
//         "password": "painting"
//     }
// }

//SIMPLE ROUTE TO JUST GET RESTAURANT NAME FROM UUID
router.get('/lookup/:uuid', function (req, res) {
    Restaurant.findOne({where:{uniqueCode: req.params.uuid}})
    .then((restaurant) => res.status(200).json(restaurant))
    .catch((err) => console.log(err))
})


module.exports = router