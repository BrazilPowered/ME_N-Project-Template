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
    const user = require("../controllers/user.controller.js");
    const { jwtAuth, validateSignup } = require("../middleware")
  
    //Just for this route, we need special headers for the JWT
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Create a new User; validate their info & requested roles with middleware
    router.post("/signup",
                [validateSignup.checkDuplicateUsers,
                 validateSignup.validateUserRoles], 
                 user.create);

    //Authenticate a user
    /* TODO: redirect to auth.controller/router
    router.post("/login", user.login);
    */

    // Retrieve a single User with *this* id
    router.get("/:id", [jwtAuth.validateToken,
                        jwtAuth.isModerator],
                        user.findOne);
    
    //Elevate a User's Credentials by adding additional roles
    router.put("/elevate",
                [jwtAuth.validateToken,
                 jwtAuth.isAdmin],
                 user.elevate);
  
    app.use("/api/user", router);
};
  