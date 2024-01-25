/*******************************************************
 * This file creates an example controller that dictates
 * business logic for the example signup route in this 
 * app.
 * 
 * This reuses the User Model, and so has none of its own
 *******************************************************/
//DB imports
const db = require("../models");
const User = db.users;
//Auth imports
const RefreshToken = db.refreshToken;
const authConfig = require("../config/auth.config.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/*****************POST*******************
 * Authenticate users login & return JWT
 * plus refreshToken
 ****************************************/
exports.login = (req, res) => {
    // Validate request
    if (!req.body.username) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    //find this user
    User.findOne({ username: req.body.username })
    //fetch all "roles", too; exclude "__v" tag
    .populate("roles","-__v") 
    .then((user) =>{
        if (!user) {
            return res.status(404).send({ message: "User Not found" });
        }
        return user;
    })//check password
    .then((user) => {
        var passwordIsRight = bcrypt.compareSync(
            req.body.password, user.password
        );
        if (!passwordIsRight){
            return res.status(401).send({ accessToken: null,
                                          message: "Invalid Password" });
        }
        return user;
    })//create token & respond to client
    .then(async (user) => {
        RefreshToken.createToken(user)
        .then((refreshToken) => { //create JWT
            /*******Roles assigned to user******/
            var assignedRoles = [];
            ///** 
            user.roles.forEach(role => {
                assignedRoles.push(role.name.toUpperCase() + "_ROLE");
            });/*************************************/
            res.status(200).send({
              id:       user._id,
              username: user.username,
              email:    user.email,
              roles:    assignedRoles,
              accessToken: createAccessToken(user.id),
              refreshToken: refreshToken
            });
          
        })
        .catch(err =>{
            res.status(500).send({ message: "A Problem occurred when reading user and creating access=> " + err })
        });
    })
    .catch(err =>{
      res.status(500).send({ message: err });
    });
}

/*****************POST*******************
 * Refresh Access Token by validating the
 * Refresh Token by extracting 
 * id, user, token, and expiration time
 * using the RefreshToken's static 
 * methods.
 * Ensures expiration is after current 
 * Date/Time (remove RefreshToken from 
 * DB if not), and generates new Access
 * Token from _id field of Refresh 
 * Token.
 ****************************************/
exports.refreshToken = (req, res) => {
    //TODO: check-> This is just a different way to extract json information
    const { refreshToken : userToken } = req.body;

    if(userToken == null) {
        return res.status(403).json({ message: "Refresh Token is missing from request body"});
    }

    RefreshToken.findOne({ token: userToken })
    .then((refreshToken)=>{
        //Check if NOT exist OR exists but NOT valid & just hasn't been cleared
        if(!(refreshToken || refreshToken.stillValid())){
            return res.status(403).json({ message: "Refresh Token not recognized. Perhaps it expired?" +
                                                    "Please sign in manually again."});
        }
        else{ //Create new token
            const newAccessToken = createAccessToken(refreshToken.user._id);
            return res.status(200).json({accessToken: newAccessToken,
                                       refreshToken: refreshToken.token})
        }
    })
    .catch((err) =>{
        return res.status(500).send({ message: err });
    }) //add catch block for the trycatch you missed
}

/****************************************
 * Generate a JWT Access token. Takes 
 * user._id for DBs user object as arg
 ****************************************/
function createAccessToken(userid){
    return jwt.sign({ id: userid },
                      authConfig.secret,
                      {
                        algorithm: 'HS256',
                        allowInsecureKeySizes: true,
                        expiresIn: authConfig.jwtExpiration*1000
                      });
}