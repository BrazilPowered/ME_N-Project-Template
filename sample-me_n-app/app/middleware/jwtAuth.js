/*************************************************
 * This middleware supplies validation for
 * - JWT Token
 * - is User a specific role type (admin/moderator)
 ************************************************/

const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config.js");
const db = require("../models");
const User = db.users;
const Role = db.roles;
//TODO: For RefreshToken flow
//const {TokenExpiredError} = jwt

/****************************************
 * Check for expired tokens, not just 
 * invalid. Different response here can
 * kick off the Refresh Token flow.
 ****************************************/
const catchExpirationError = (err, res) => {
    if (err instanceof jwt.TokenExpiredError){
        return res.status(401).send({message:"Unauthorized; Access Token is expired."});
    }
    return res.status(401).send({message: "Unauthorized."});
}

/****************************************
 * Validate that:
 * -this user provided a JWT token
 * -the token is valid for their user ID
 * TODO: validate time & other info
 ****************************************/
validateToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if(!token){
        return res.status(403).send({ message: "No token provided" });
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err) {
            //Then act depending on type of error:
            return catchExpirationError(err, res);
        }//else
        req.userId = decoded.id;
        next();
    });
};


/****************************************
 * Checks if user has specific role 
 * access by name of the role
 * 
 * NOTE: Req.userId only exists when 
 * validateToken was first run to get an
 * accurate userId to check below
 ****************************************/
/****************************************
 * Checks if user is a Moderator by role
 * Set name of Moderator role in db.ROLES,
 * sorted by priority.
 * MUST be used by jwtAuth.validateToken
 * first.
 ****************************************/
isModerator = (req, res, next) => {
  roleName=db.ROLES[1];
  hasRole(req.userId,roleName)
  .then((admittance)=>{
      if(admittance === false){
          //admins are also Moderators, so check that role, too
          return hasRole(req.userId,db.ROLES[0])
      }else{
          //if no matching role, send 403 error
          next();
      }
  })
  .then((admittance) => {
      if(admittance === true){
          next();
      }else{
          //if no matching role, send 403 error
          res.status(403).send({ message: "Requires \""+roleName+"\" Role Privileges!" });
      }
  })
  .catch(err=>{
      //errors would be returned as non 'true' or 'false' values
      res.status(500).send({ message: err });
  })
};

/****************************************
 * Checks if user is an Admin by role.
 * Set name of admin role in db.ROLES,
 * sorted by priority.
 * MUST be used with jwtAuth.validateToken
 * first.
 ****************************************/
isAdmin = (req, res, next) => {
    roleName=db.ROLES[0];
    hasRole(req.userId,roleName)
    .then((admittance)=>{
        if(admittance === true){
            next();
        }else{
            //if no matching role, send 403 error
            res.status(403).send({ message: "Requires \""+roleName+"\" Role Privileges!" });
        }
    }).catch(err=>{
        //errors would be returned as non 'true' or 'false' values
        res.status(500).send({ message: err });
    })
};

/********************************************
 * Checks if user has a role by [String] roleName
 ********************************************/
hasRole = (userId, roleName) => {
    return User.findById(userId)
    .then((user) => {
        return Role.find({ _id: { $in: user.roles } })
    })
    .then((roles) => {
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === roleName) {
                return true;
            }
        }
        return false;
    }).catch((err=>{
        return err;
    }))
};

//configure methods to export
  const jwtAuth = {
    validateToken,
    isModerator,
    isAdmin
  };
  module.exports = jwtAuth;