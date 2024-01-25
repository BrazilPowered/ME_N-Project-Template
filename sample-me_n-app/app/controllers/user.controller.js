/*******************************************************
 * This file creates an example controller that dictates
 * business logic for the example signup route in this 
 * app.
 *******************************************************/
//DB imports
const db = require("../models");
const User = db.users;
//Auth imports
const Role = db.roles;
const defaultRole = db.ROLES[db.ROLES.length];
const bcrypt = require("bcryptjs");

/****************POST********************
 * Create a new User object & store in DB. 
 ****************************************/
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }

  // Create a User
  const user = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    phone: req.body.phone ? req.body.phone : false
  });

  // Save User in the database
  user
    .save(user)
    .then(user => {
      //Add Roles for the new user
      if(req.body.roles){
        Role.find(
        {
          name: { $in: req.body.roles }
        })
        .then((roles)=>{
          user.roles = roles.map(role=>role._id);
          user.save().then(()=>{
            res.send({ message: "User was created Successfully!" });
          })
        })
      } else { //default case - set role to default role "user"
        Role.findOne({ name: defaultRole })
        .then((role)=>{
          user.roles= [role._id];
          user.save()
          .then(()=>{
            res.send({ message: "User was created successfully!"});
          })
        })
      }
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
exports.elevate = (req, res) => {
  const id = req.query.id;
  //Halt if no Roles or UserID
  if(!(req.body.roles && id)){
    res.status(400).send({ message: "Target user roles & id must be included for elevation!" });
  }else{//Add Roles for the  user
    Role.find(
    {
      name: { $in: req.body.roles }
    })
    .then((roles)=>{
      return User.findByIdAndUpdate(id, {roles: roles.map(role=>role._id)}, { useFindAndModify: false })
    .then(()=>{
        res.status(200).send({ message: `User record with id=${id} was updated successfully.` });
      })
    })
    .catch(err => {
      res.status(500).send({
        message: `Error updating User record with id=${id}; ${err}` 
      });
    });
  } 
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
