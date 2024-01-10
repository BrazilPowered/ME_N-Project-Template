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
        return res.status(401).send({ message: "Unauthorized" + err });
    }//else
    req.userId = decoded.id;
    next();
  });
};


/****************************************
 * Checks if user has specific role 
 * access by name of the role
 * 
 * TODO: write isRoleByName() to reduce 
 * code duplication in isAdmin and isModerator
 ****************************************/
/****************************************
 * Checks if user is a Moderator by role
 ****************************************/
isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "moderator") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role Priviliges!" });
        return;
      }
    );
  });
};

/****************************************
 * Checks if user is an Admin by role
 ****************************************/
isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
 
    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Requires Admin Role Privileges!" });
        return;
      }
    );
  });
};

//configure methods to export
  const jwtAuth = {
    validateToken,
    isModerator,
    isAdmin
  };
  module.exports = jwtAuth;