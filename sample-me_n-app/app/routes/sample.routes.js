module.exports = app => {
  const samples = require("../controllers/sample.controller.js");

  var router = require("express").Router();

  // Create a new Sample
  router.post("/", samples.create);

  // Retrieve all Samples
  router.get("/", samples.findAll);

  // Retrieve all Samples with OptionalProp set to true
  router.get("/optionalProp", samples.findAllOfOptionalProp);

  // Retrieve a single Sample with *this* id
  router.get("/:id", samples.findOne);

  // Update Sample with *this* id
  router.put("/:id", samples.update);

  // Remove Sample with *this* id
  router.delete("/:id", samples.delete);

  // Remove all stored samples
  router.delete("/", samples.deleteAll);

  app.use("/api/samples", router);
};
