/*************************************************
 * This file creates is an index to coordinate all 
 * routes for the project to a single export to be 
 * imported to server.js
 * 
 * Be sure to include all routes here
 ************************************************/const dbConfig = require("../config/db.config.js");

 //Our Cohice of Schema framework
const mongoose = require("mongoose");
/*mongoose-paginate-v2 Required for paginated.model: */
const mongoosePaginate = require("mongoose-paginate-v2");

//Enable promise libraries for Mongoose.
mongoose.Promise = global.Promise;
//Added below to prepare for change in 7.x defaults
mongoose.set('strictQuery', false);

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.samples = require("./sample.model.js")(mongoose);
db.users = require("./user.model.js")(mongoose);
db.paginateds = require("./paginated.model.js")(mongoose,mongoosePaginate);

module.exports = db;
