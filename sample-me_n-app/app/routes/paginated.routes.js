/*****************************************************
 * This routes to all the paths our sample uses to 
 * showcase navigating between different controller
 * functionality with paginated results.
 * 
 * Note that there is no real difference in the router 
 * when pages are being used.
 *****************************************************/
module.exports = app => {
  const paginateds = require("../controllers/paginated.controller.js");

  var router = require("express").Router();

  // Create a new Paginated
  router.post("/", paginateds.create);

  // Retrieve all Paginateds
  router.get("/", paginateds.findAll);

  // Retrieve all Paginateds with OptionalProp set to true
  router.get("/optionalProp", paginateds.findAllOfOptionalProp);

  // Retrieve a single Paginated with *this* id
  router.get("/:id", paginateds.findOne);

  // Update Paginated with *this* id
  router.put("/:id", paginateds.update);

  // Remove Paginated with *this* id
  router.delete("/:id", paginateds.delete);

  // Remove all stored Paginateds
  router.delete("/", paginateds.deleteAll);

  app.use("/api/paginateds", router);
};
