/*****************************************************
 * This routes to all the paths users need to modify 
 * their information in their profile. 
 * Creating Accounts is also managed here.
 * 
 * Login and Authentications tokens are managed in
 * the auth routes & controller.
 *****************************************************/
module.exports = app => {
    var router = require("express").Router();
    const authenticate = require("../controllers/authenticate.controller.js");

    //Just for this route, we need special headers for the JWT
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    //Authenticate a user
    router.post("/login", authenticate.login);

    //Refresh an access token with a refreshToken
    router.post("/refreshToken", authenticate.refreshToken);
  
    app.use("/authenticate", router);
  };
  