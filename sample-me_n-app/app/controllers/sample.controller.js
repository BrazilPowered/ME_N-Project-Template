/*******************************************************
 * This file creates a sample controller that dictates
 * business logic for basic CRUD operations.
 *******************************************************/
const db = require("../models");
const Sample = db.samples;

/****************POST********************
 * Create & Save new Sample object & 
 * store in DB. 
 ****************************************/
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({ message: "Request Body cannot be empty!" });
    return;
  }

  // Create a Sample Object
  const sample = new Sample({
    title: req.body.title,
    description: req.body.description,
    optionalProp: req.body.optionalProp ? req.body.optionalProp : false
  });

  // Store Sample object in the database
  sample
    .save(sample)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error occurred while storing the Sample."
      });
    });
};

/****************POST********************
 * Retrieve all Samples from the database 
 * with a filter/condition using title field.
 ****************************************/
exports.findAll = (req, res) => {
  const title = req.query.title;
  //uses a RegEx for the .find method; 
  //turn Title into one here
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Sample.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving samples."
      });
    });
};

/*****************GET********************
 * Find a single Sample object with an id
 ****************************************/
exports.findOne = (req, res) => {
  const id = req.params.id;

  Sample.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Did not find Sample with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Sample with id " + id });
    });
};

/*****************PUT********************
 * Update the Sample with *this* id 
 * (in the request)
 ****************************************/
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data in an Update request cannot be empty!"
    });
  }

  const id = req.params.id;

  Sample.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Sample with id ${id}. Sample might not have been found.`
        });
      } else res.send({ message: "Sample was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Sample with id " + id
      });
    });
};

/***************DELETE*******************
 * Delete a Sample object with this 
 * specified id (in the request)
 ****************************************/
exports.delete = (req, res) => {
  const id = req.params.id;

  Sample.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot remove Sample with id ${id}. Sample might not have been found.`
        });
      } else {
        res.send({
          message: "Sample was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not remove Sample with id " + id +". Server faced an unknown error: "//+ err.body
      });
    });
};

/***************DELETE*******************
 * Delete all Samples from the database.
 ****************************************/
exports.deleteAll = (req, res) => {
  Sample.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Samples were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while removing all samples."
      });
    });
};

/*****************GET********************
 * Find all Samples with the 
 * optionalProperty set to true
 ****************************************/
exports.findAllOfOptionalProp = (req, res) => {
  Sample.find({ optionalProp: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving samples."
      });
    });
};
