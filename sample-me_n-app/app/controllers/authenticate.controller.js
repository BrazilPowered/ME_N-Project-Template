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
const authConfig = require("../config/auth.config.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/*****************POST*******************
 * Authenticate users login & return JWT
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
    else{//check password
      var passwordIsRight = bcrypt.compareSync(
        req.body.password, user.password
      );
      if (!passwordIsRight){
        return res.status(401).send({ message: "Invalid Password" });
      }
      else{//create JWT
        const token = jwt.sign({ id: user.id },
                                 authConfig.secret,
                                 {
                                   algorithm: 'HS256',
                                   allowInsecureKeySizes: true,
                                   expiresIn: 86400 //24 hours
                                 });
        
        /*******DEBUG Roles assigned to user******/
        var assignedRoles = [];
        /** 
        user.roles.forEach(role => {
          assignedRoles.push(role.name.toUpperCase() + "_ROLE");
        });/*************************************/
        res.status(200).send({
          id:       user._id,
          username: user.username,
          email:    user.email,
          roles:    assignedRoles,
          accessToken: token
        });

      }
    }

  })
  .catch(err =>{
    res.status(500).send({ message: err });
  });
}
