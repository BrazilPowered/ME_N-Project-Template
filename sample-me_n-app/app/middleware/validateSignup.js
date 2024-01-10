/*************************************************
 * This middleware supplies validation for
 * - New User signup/configuration
 *   -Username duplication
 *   -Email duplication
 *   -if requested role is valid
 ************************************************/
const db = require("../models");
const ROLES = db.ROLES;
const User = db.users;

/*****************GET********************
 * Search users to ensure this username
 * and email aren't already registered.
 * 
 * Username & Email should always be unique.
 ****************************************/
checkDuplicateUsers = (req, res, next) => {
  //Username
  User.findOne({ username: req.body.username })
  .then((user) => {
    if(user){
      return res.status(400).send({ message:"Username is already in use!" });
    }
    //Email --> Embedded in username Promise so we only run this if username passes
    User.findOne({ email: req.body.email })
    .then((user) => {
      if(user){
          return res.status(400).send({ message:"Email is already in use!" });
      }
      //then 
      next();
    });
  }).catch((err)=>{
    res.status(500).send({ message: err });
    console.log(err);
  });
};

/****************************************
 * Search roles to ensure this user's
 * requested roles are valid
 ****************************************/
validateUserRoles = (req, res, next) => {
  if(req.body.roles) {
    req.body.roles.forEach(role => {
      if(!ROLES.includes(role)){
        res.status(400).send({
          message: "Error! Role "+role+" does not exist!"
        });
        return;
      }
    });
  }
  //then
  next();
};

//configure methods to export
const validateSignup = {
    checkDuplicateUsers,
    validateUserRoles
}
module.exports = validateSignup;