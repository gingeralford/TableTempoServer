const router = require('express').Router();
const Party = require('../db').import('../models/party');
const { Op } = require("sequelize");
const validateSessionStaff = require('../middleware/validateSessionStaff');


router.get('/practice', function(req, res){
    res.send('Hey This is a practice route for party');
})

//PARTY CREATE
router.post('/create', validateSessionStaff, function (req, res) {
    Party.create({
        name:req.body.party.name,
        partyNum: req.body.party.partyNum,
        telephone: req.body.party.telephone,
        over21: req.body.party.over21,
        timeArrived: new Date(),
        timeEstimated: req.body.party.timeEstimated,
        timeSeated: req.body.party.timeSeated, 
        //parties should always started with seated/leftUnseated as false
        seated: false,
        leftUnseated: false,
        specialNotes: req.body.party.specialNotes,
        //changed staffId and restaurantId to both come from the token
        staffId: req.staff.id,
        restaurantId: req.staff.restaurantId,
        uniqueCode: req.staff.uniqueCode
    })
    .then(
        function successfulCreation(party) {
            res.status(200).json({
                party: party,
                message: "party created successfully",
            })
        }     
    )
    .catch(err => res.status(500).json({error:err}))
})
// example request:
// {
//     "party" : {
//         "name": "Griswold",
//         "partyNum": "4",
//         "telephone": "+18125551234",
//         "over21" : "false",
//         "timeArrived" : "2021-04-08 19:36:19.748-04",
//         "timeEstimated": "2021-04-08 19:36:19.748-04",
//         "timeSeated": "2021-04-08 19:36:19.748-04",
//         "seated": "false",
//         "leftUnseated": "false",
//         "specialNotes": "wacky family",
//     }
// }


//PARTY UPDATE
router.put('/update/:partyId', validateSessionStaff, function (req, res){
    const updateParty = {
        name:req.body.party.name,
        partyNum: req.body.party.partyNum,
        telephone: req.body.party.telephone,
        over21: req.body.party.over21,
        timeArrived: req.body.party.timeArrived,
        timeEstimated: req.body.party.timeEstimated,
        timeSeated: req.body.party.timeSeated,
        seated: req.body.party.seated,
        leftUnseated: req.body.party.leftUnseated,
        specialNotes: req.body.party.specialNotes,
        //Changed staffId, restaurantID, and uniqueCode to come from the token
        staffId: req.staff.id,
        restaurantId: req.staff.restaurantId,
        uniqueCode: req.staff.uniqueCode
    };

    const query = {where: {id: req.params.partyId}};

    Party.update(updateParty, query)
    .then((party) => res.status(200).json(party))
    .catch((err) => res.status(500).json({error:err}))
});
// example request:
// {
//     "party" : {
//         "name": "Griswold",
//         "partyNum": "5",
//         "telephone": "+18125551234",
//         "over21" : "true",
//         "timeArrived" : "2021-04-08 19:36:19.748-04",
//         "timeEstimated": "2021-04-08 19:36:19.748-04",
//         "timeSeated": "2021-04-08 21:36:19.748-04",
//         "seated": "false",
//         "leftUnseated": "false",
//         "specialNotes": "wacky family",
//     }
// }

//GET TODAY'S PARTIES (for ONE restaurant and ONE staff member)
router.get('/today', validateSessionStaff, function(req,res){
    // let staffId = req.staff.id < will need this back in when Validate Session
    let time = new Date();
    console.log(time);
    //was set to 5
    if (time.getHours() >= 9) {
        time.setHours(9,0,1)
        console.log(time)
        //right now uses UTC which is 4 hours ahead
    } else {
        time.setHours(9,0,1);
        time.setDate(time.getDate() - 1);
        console.log(time)
    };
    let staffId = req.staff.id;
    let restaurantCode = req.staff.uniqueCode;
    Party.findAll({
        where: {
            [Op.and]: [
            {staffId: staffId},
            {uniqueCode: restaurantCode},
            {timeArrived: { [Op.gt]: time}}
            //timeArrived greater than now minus 1 day
            ]},
        order: [ [ 'leftUnseated', 'ASC' ], [  'seated', 'ASC'  ], [ 'timeEstimated', 'ASC' ] ]
    })
        .then((parties) => res.status(200).json(parties))
        .catch((err) => res.status(500).json({error:err}))
})

//GET TODAY'S PARTIES (ONE restaurant but all staff)
router.get('/todayall', validateSessionStaff, function(req,res){
    let restaurantCode = req.staff.uniqueCode;
    //Function to set time to 5am either today or day before
    let time = new Date();
    // console.log(time);
    if (time.getHours() >= 5) {
        time.setHours(5,0,1)
        console.log(time)
        //right now uses UTC which is 4 hours ahead
    } else {
        time.setHours(5,0,1);
        time.setDate(time.getDate() - 1);
        console.log(time)
    };

    Party.findAll({
        where: {
            [Op.and]: [
            {uniqueCode: restaurantCode},
            {timeArrived: { [Op.gt]: time}}
            ]}
    })
        .then((parties) => res.status(200).json(parties))
        .catch((err) => res.status(500).json({error:err}))
})

//GET ALL PARTIES BETWEEN START DATE AND END DATE (FROM URL QUERY)
router.get('/daterange/', validateSessionStaff, function(req,res){
    let uniqueCode = req.staff.uniqueCode;
    let endDate= req.query.endDate;
    let startDate= req.query.startDate;

    Party.findAll({
        where: {
            [Op.and]: [
            {uniqueCode: uniqueCode},
            //date range between startDate and endDate input in URL query
            {timeArrived: { [Op.lte]: endDate}},
            {timeArrived: { [Op.gte]: startDate}}
            ]},
            order: [ [ 'timeArrived', 'DESC' ] ]
    })
        .then((allParties) => res.status(200).json(allParties))
        .catch((err) => res.status(500).json({error:err}))
})

//SEARCH BY NAME FIELD (FROM URL QUERY)
router.get('/byname/', validateSessionStaff, function(req,res){
    let uniqueCode = req.staff.uniqueCode;
    let name= req.query.name;
    Party.findAll({
        where: {
            [Op.and]: [
            {uniqueCode: uniqueCode},
            {name: {
                [Op.iLike]: `%${name}%`
              }}
            ]},
            order: [ [ 'timeArrived', 'DESC' ] ]
    })
        .then((allParties) => res.status(200).json(allParties))
        .catch((err) => res.status(500).json({error:err}))
})


//DELETE PARTY
router.delete('/delete/:partyId', validateSessionStaff, function(req, res) {
    let staffId = req.staff.id;
    let restaurantCode = req.staff.uniqueCode;
    const query = {where: {
        [Op.and]: [
        {uniqueCode: restaurantCode},
        {staffId: staffId},
        {id: req.params.partyId}
        ]}
    };

    Party.destroy(query)
    .then(() => res.status(200).json({message: "This party has been removed"}))
    .catch((err) => res.status(500).json({error:err}));
});


module.exports = router