/*******************************************************
 * This file creates an example controller that dictates
 * business logic for the example signup route in this 
 * app.
 *******************************************************/
const db = require("../models");
const User = db.users;

/****************POST********************
 * Create a new User object & store in DB. 
 ****************************************/
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a User
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone ? req.body.phone : false
  });

  // Save User in the database
  user
    .save(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
};

/*****************GET********************
 * Retrieve all Users from the database
 * with a filter condition using name field.
 ****************************************/
exports.findAll = (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};

  User.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
};

/****************POST********************
 * Find a single User record with an id
 ****************************************/
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "User record not found with id=" + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving User record with id=" + id });
    });
};

/*****************PUT********************
 * Update a user by the id in the request
 ****************************************/
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update User record with id=${id}. Maybe User was not found?`
        });
      } else res.send({ message: `User record with id=${id} was updated successfully.` });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User record with id=" + id
      });
    });
};

/***************DELETE*******************
 * Delete a User record with the 
 * specified id in the request
 ****************************************/
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete User record with id=${id}. Maybe User was not found?`
        });
      } else {
        res.send({
          message: `User record with id=${id} was deleted successfully!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User record with id=" + id
      });
    });
};

/***************DELETE*******************
 * Delete all Users from the database.
 ****************************************/
exports.deleteAll = (req, res) => {
  User.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Users were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all users."
      });
    });
};

/****************POST********************
 * Find all Users with no (false) 
 * phone records
 ****************************************/
exports.findAllNoPhones = (req, res) => {
  User.find({ phone: false })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
};
