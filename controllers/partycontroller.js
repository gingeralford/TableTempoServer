const router = require('express').Router();
const Party = require('../db').import('../models/party');
const { Op } = require("sequelize");
const validateSessionStaff = require('../middleware/validateSessionStaff');
const validateSessionRest = require('../middleware/validateSessionRest')

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
        timeArrived: req.body.party.timeArrived,
        timeEstimated: req.body.party.timeEstimated,
        timeSeated: req.body.party.timeSeated,
        //parties should always started with seated/leftUnseated false
        seated: false,
        leftUnseated: false,
        specialNotes: req.body.party.specialNotes,
        //changed staffId and restaurantId to both come from the token
        staffId: req.staff.id,
        restaurantId: req.staff.restaurantId
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
//UPDATE STAFF ENTRY
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
        //Changed staffId and restaurantId to come from the token
        staffId: req.staff.id,
        restaurantId: req.staff.restaurantId
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
//         "staffId": "1",
//         "restaurantId": "3"
//     }
// }

//GET TODAY'S PARTIES (for ONE restaurant and ONE staff member)
//TODO: Add in sorting by time AND by seated true/false
//TODO: Add better time handling so it returns parties from 5am on, not exactly 24hrs
router.get('/today/', validateSessionStaff, function(req,res){
    // let staffId = req.staff.id < will need this back in when Validate Session
    let staffId = req.staff.id;
    let restaurantId = req.staff.restaurantId;
    Party.findAll({
        where: {
            [Op.and]: [
            {staffId: staffId},
            {restaurantId: restaurantId},
            {timeArrived: { [Op.gt]: new Date(new Date().setDate(new Date().getDate() - 1))}}
            //timeArrived greater than now minus 1 day
            ]}
    })
        .then((parties) => res.status(200).json(parties))
        .catch((err) => res.status(500).json({error:err}))
})

//GET TODAY'S PARTIES (ONE restaurant but all staff)
//TODO: Add better time handling so it returns parties from 5am on, not exactly 24hrs
router.get('/todayall', validateSessionStaff, function(req,res){
    let restaurantId = req.staff.restaurantId;
    Party.findAll({
        where: {
            [Op.and]: [
            {restaurantId: restaurantId},
            {timeArrived: { [Op.gt]: new Date(new Date().setDate(new Date().getDate() - 1))}}
            //timeArrived greater than now minus 1 day
            ]}
    })
        .then((parties) => res.status(200).json(parties))
        .catch((err) => res.status(500).json({error:err}))
})

//GET ALL PARTIES BY DATE RANGE (Must be logged in as Restaurant view)
//TODO: Add in date functionality with the date selection system used
router.get('/daterange', validateSessionRest, function(req,res){
    let restaurantId = req.restaurant.id;
    Party.findAll({
        where: {
            [Op.and]: [
            {restaurantId: restaurantId},
            {timeArrived: { [Op.lt]: new Date()}}
        //returns everything before this moment, for now...
            ]}
    })
        .then((allParties) => res.status(200).json(allParties))
        .catch((err) => res.status(500).json({error:err}))
})


//DELETE PARTY
router.delete('/delete/:partyId', validateSessionStaff, function(req, res) {
    let staffId = req.staff.id;
    let restaurantId = req.staff.restaurantId;
    const query = {where: {
        [Op.and]: [
        {restaurantId: restaurantId},
        {staffId: staffId},
        {id: req.params.partyId}
        ]}
    };

    Party.destroy(query)
    .then(() => res.status(200).json({message: "This party has been removed"}))
    .catch((err) => res.status(500).json({error:err}));
});


module.exports = router