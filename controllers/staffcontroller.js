const router = require('express').Router();
const Staff = require('../db').import('../models/staff');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
// const validateSessionRest = require('../middleware/validateSessionRest');
const validateSessionStaff = require('../middleware/validateSessionStaff');

router.get('/practice', function(req, res){
    res.send('Hey This is a practice route for staff');
})

//CREATE STAFF - staff/create
router.post('/create/:uniqueCode', function (req, res) {
    Staff.create({
        uniqueCode : req.params.uniqueCode,
        restaurantId: req.body.staff.restaurantId,
        email: req.body.staff.email,
        password: bcrypt.hashSync(req.body.staff.password, 10),
        active: req.body.staff.active,
        admin: req.body.staff.admin
    })
    .then(
        function successfulCreation(staff) {
            let token = jwt.sign({id: staff.id, uniqueCode: staff.uniqueCode, restaurantId: staff.restaurantId, admin: staff.admin, active: staff.active}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
            
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
                        let token = jwt.sign({id: staff.id, uniqueCode: staff.uniqueCode, restaurantId: staff.restaurantId, admin: staff.admin, active: staff.active}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
                        
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
                res.status(500).send({error: "No staff member found"})
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
router.get('/', validateSessionStaff, function(req,res){
    //exits if staff does not have admin permission
    if(req.staff.admin !== true){
        return;
    }
    let restaurantCode = req.staff.uniqueCode
    Staff.findAll({
        where: {uniqueCode: restaurantCode}
        , include: 'parties'
    } 
)
        .then((allStaff) => res.status(200).json(allStaff))
        .catch((err) => res.status(500).json({error:err}))
})
//NO BODY FOR THIS REQUEST, ALL INFO COMES TOKEN


//UPDATE STAFF MEMBER INFO
router.put('/update/:staffId', validateSessionStaff, function (req, res){
    //exits if staff does not have admin permission
    if(req.staff.admin !== true){
        return;
    }

    const updateStaff = {
        // email: req.body.staff.email, <-might not want to update this, thinking of a use case
        password: bcrypt.hashSync(req.body.staff.password, 10),
        active: req.body.staff.active,
        admin: req.body.staff.admin 
    };

    const query = { 
        where: {
            [Op.and]: [
                {id: req.params.staffId},
                {uniqueCode: req.staff.uniqueCode}
            ]
        }
    };

    Staff.update(updateStaff, query)
    .then((messages) => res.status(200).json(messages))
    .catch((err) => res.status(500).json({error:err}))
});
// example request:
// {
//     "staff" : {
//         "password": "leavemealonenow",
//         "active": true,
//         "admin" true
//     }
// }


//DELETE A STAFF MEMBER
router.delete('/delete/:staffId', validateSessionStaff, function(req, res) {
    //exits if staff does not have admin permission
    if(req.staff.admin !== true){
        return;
    }
    const query = { 
        where: {
            [Op.and]: [
                {id: req.params.staffId},
                {uniqueCode: req.staff.uniqueCode}
            ]
        }
    };

    Staff.destroy(query)
    .then(() => res.status(200).json({message: "This staff member has been removed"}))
    .catch((err) => res.status(500).json({error:err}));
});
//NO BODY FOR THIS REQUEST, ALL INFO TAKEN FROM TOKEN AND URL PARAMS

module.exports = router;