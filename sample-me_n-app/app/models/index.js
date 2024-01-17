/*************************************************
 * This file creates/is an index to coordinate all 
 * routes for the project to a single export to be 
 * imported to server.js
 * 
 * Be sure to include all routes here
 ************************************************/
const dbConfig = require("../config/db.config.js");

 //Our Choice of Schema framework
const mongoose = require("mongoose");

//Enable promise libraries for Mongoose.
mongoose.Promise = global.Promise;
//Added below to explicitly prepare for change in 7.x defaults
mongoose.set('strictQuery', false);

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.samples = require("./sample.model.js")(mongoose);

module.exports = db;
