const jwt = require('jsonwebtoken');
const Staff = require('../db').import('../models/staff');

const validateSessionStaff =  (req, res, next) => {
    const token = req.headers.authorization;
    
    console.log('token -->', token);

    if(!token) {
        return res.status(403).send({ auth: false, message: "No token provided" })
    } else {
        //call upon JWT package and invoke verify method
        //jwt.verify(token, secretorPublicKey, [options, callback])
        //verify method decodes the token
        //in callback, decodeToken will contain decoded payload, IF sucessful
        //if not successful, decodeToken remains undefined, err is null by default
        jwt.verify(token, process.env.JWT_SECRET, (err, decodeToken) => {
            console.log('decodeToken -->', decodeToken);
            //checks if there is no err, and if decodeToken isn't undefined
            if(!err && decodeToken) {
                //sequelize findOne method looks for id in staffs table that matches decodeToken's id value
                Staff.findOne({
                    where: {
                        id: decodeToken.id
                    }
                })
                .then(staff => {
                    console.log('staff -->', staff);
                    //promise is returned, if no user throws error
                    if(!staff) throw err;
                    console.log('req -->', req);
                    //sets the request user value to the user value found in db, WHY?
                    req.staff = staff;
                    return next(); //sends to next() function
                })
                .catch(err => next(err)); //sends to next() function whether success or failure
            } else {
                req.errors = err;
                //if no value for decodeToken, take err parameter from original function and append it to the req object as new key-value pair
                return res.status(500).send('Not Authorized');
            }
        });
    }
};

module.exports = validateSessionStaff