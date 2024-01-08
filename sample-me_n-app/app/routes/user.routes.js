module.exports = app => {
    const user = require("../controllers/user.controller.js");
  
    var router = require("express").Router();
  
    // Create a new User
    router.post("/sign_up", user.create);
  
    // Retrieve all Users
    router.get("/all", user.findAll);
  
    // Retrieve all published Users with no ("false") stored phone numbers
    router.get("/published", user.findAllNoPhones);
  
    // Retrieve a single User with *this* id
    router.get("/:id", user.findOne);
  
    // Update a User with *this* id
    router.put("/:id", user.update);
  
    // Delete User with *this* id
    router.delete("/:id", user.delete);
  
    // Delete all users
    router.delete("/", user.deleteAll);
  
    app.use("/api/user", router);
  };
  