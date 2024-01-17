/*******************************************************
 * This file creates an example controller that dictates
 * business logic using PAGINATION to return results.
 *******************************************************/
const db = require("../models");
const Paginated = db.paginateds;

/****************************************
 * Enables default values to be set for 
 * pagintion across the entire controller
 ****************************************/
const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

/****************POST********************
 * Create & Save new Paginated object & store
 * in DB. **No pagination** as this is not a
 * GETter function***********************/
exports.create = (req, res) => {
  // Validates request
  if (!req.body.title) {
    res.status(400).send({ message: "Request Body cannot be empty!" });
    return;
  }

  // Creates the Paginated Object
  const paginated = new Paginated({
    title: req.body.title,
    description: req.body.description,
    optionalProp: req.body.optionalProp ? req.body.optionalProp : false
  });

  //Stores Paginated object in the database
  paginated
    .save(paginated)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error occurred while storing the Paginated object."
      });
    });
};

/*****************GET********************
 * Retrieve all Paginated objects from the 
 * database with a filter/condition
 ****************************************/
exports.findAll = (req, res) => {
  const { page, size, title } = req.query;
  //Makes 'title' a RegEx, required for the .find method
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  //PAGINATION setup, or use defaults:
  const { limit, offset } = getPagination(page, size);

  Paginated.paginate(condition, {limit, offset})
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        paginateds: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Paginated objects."
      });
    });
};

/*****************GET********************
 * Find a single Paginated object with an id
 * **NO PAGINATION**, as this returns only 
 ** ONE Result *****************************/
exports.findOne = (req, res) => {
  const id = req.params.id;

  Paginated.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Did not find Paginated object with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Paginated object with id " + id });
    });
};

/*****************PUT********************
 * Update SINGLE Paginated object in DB 
 * with the specified id (in the request).
 * **No pagination** as this is not a
 * GETter function***********************/
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data in an Update request cannot be empty!"
    });
  }

  const id = req.params.id;

  Paginated.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Paginated object with id ${id}. 
                    Paginated object might not have been found.`
        });
      } else res.send({ message: "Paginated object was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Paginated object with id " + id
      });
    });
};

/****************DELETE******************
 * Delete SINGLE Paginated object with 
 * the specified id (in the request).
 * **No pagination** as this is not a
 * GETter function***********************/
exports.delete = (req, res) => {
  const id = req.params.id;

  Paginated.findByIdAndDelete(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Paginated object with id ${id}. 
                    Paginated object might not have been found.`
        });
      } else {
        res.send({
          message: "Paginated object was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not remove Paginated object with id " + id +". Server faced an unknown error: "//+ err.body
      });
    });
};

/***************DELETE*******************
 * Delete all Paginated objects from the 
 * database.
 * **No pagination** as this is not a
 * GETter function***********************/
exports.deleteAll = (req, res) => {
  Paginated.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Paginated objects were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while removing all Paginated objects."
      });
    });
};

/*****************GET********************
 * Find all Paginated objects with the 
 * optionalProperty set to true
 ****************************************/
exports.findAllOfOptionalProp = (req, res) => {
  //PAGINATION setup, or use defaults:
  const { limit, offset } = getPagination(req.query.page, req.query.size);

  Paginated.paginate({ optionalProp: true }, {limit,offset})
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        paginateds: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Paginated Objects."
      });
    });
};
