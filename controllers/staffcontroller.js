const router = require('express').Router();
const Staff = require('../db').import('../models/staff');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
const validateSessionRest = require('../middleware/validateSessionRest');

router.get('/practice', function(req, res){
    res.send('Hey This is a practice route for staff');
})

//CREATE STAFF - restaurant/create
router.post('/create/:uniqueCode', function (req, res) {
    Staff.create({
        uniqueCode : req.params.uniqueCode,
        restaurantId: req.body.staff.restaurantId,
        //TODO: do i need restaurantID if I have uniqueCode? Probably need to look up restaurantId by uniqueCode
        email: req.body.staff.email,
        password: bcrypt.hashSync(req.body.staff.password, 17),
        active: false,
        admin: false
        //want both active and admin set to false always as a starting point
    })
    .then(
        function successfulCreation(staff) {
            let token = jwt.sign({id: staff.id, uniqueCode: staff.uniqueCode, restaurantId: staff.restaurantId}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
            
            res.status(200).json({
                staff: staff,
                message: "Staff created successfully",
                sessionToken: token
            })
        }     
    )
    .catch(err => res.status(500).json({error:err}))
})
// example request:
//http://localhost:3000/staff/create/e359a1b1-9743-44f3-9ca5-8d6b52e89f12 
// {
//     "staff" : {
//         "restaurantId": "3",
//         "email": "jerry@jurassicfork.com",
//         "password": "leavemealone"
//     }
// }

//STAFF LOGIN
router.post('/login', function (req, res) {
    Staff.findOne({where:{email:req.body.staff.email}})
    .then(
        function successfulLogin(staff) {
            if(staff){
                bcrypt.compare(req.body.staff.password, staff.password, function(err, matches){
                    if(matches){
                        let token = jwt.sign({id: staff.id, uniqueCode: staff.uniqueCode, restaurantId: staff.restaurantId}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
                        
                        res.status(200).json({
                            staff: staff,
                            message: "Staff has logged in successfully",
                            sessionToken: token
                        })
                    } else { 
                        res.status(502).send({error: "Failed Login"});
                    }            
            });
            } else {
                res.status(500).send("No staff member found")
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
//No restaurant name or anything else needed

//GET ALL STAFF (for given restaurant- Admin restaurant account only)
router.get('/', validateSessionRest, function(req,res){
    let restaurantCode = req.restaurant.uniqueCode
    // let restaurantId = req.body.staff.restaurantId;
    Staff.findAll({
        where: {uniqueCode: restaurantCode}
        // , include: 'parties' DOESN"T WORK AHHH!!!
    } 
)
        .then((allStaff) => res.status(200).json(allStaff))
        .catch((err) => res.status(500).json({error:err}))
})

//UPDATE STAFF MEMBER INFO
router.put('/update/:staffId', validateSessionRest, function (req, res){
    const updateStaff = {
        // email: req.body.staff.email, <-might not need this, thinking of a use case
        password: bcrypt.hashSync(req.body.staff.password, 17),
        active: req.body.staff.active
        //admin: false Maybe don't need this database line, unless need to switch off and on
    };

    const query = { 
        where: {
            [Op.and]: [
                {id: req.params.staffId},
                {uniqueCode: req.restaurant.uniqueCode}
            ]
        }
    };

    Staff.update(updateStaff, query)
    .then((messages) => res.status(200).json(messages))
    .catch((err) => res.status(500).json({error:err}))
});
//TODO: Do I want to move staffId out of params into request? 
// example request:
// {
//     "staff" : {
//         "password": "leavemealonenow",
//         "active": true
//     }
// }

//DELETE A STAFF MEMBER
router.delete('/delete/:staffId', validateSessionRest, function(req, res) {
    // const query = {where: {id: req.params.staffId, restaurantId: req.body.staff.restaurantId}};
    const query = { 
        where: {
            [Op.and]: [
                {id: req.params.staffId},
                {uniqueCode: req.restaurant.uniqueCode}
            ]
        }
    };

    Staff.destroy(query)
    .then(() => res.status(200).json({message: "This staff member has been removed"}))
    .catch((err) => res.status(500).json({error:err}));
});
// example request:
// {
//     "staff" : {
//         "restaurantId": "3"
//     }
// }

module.exports = router;