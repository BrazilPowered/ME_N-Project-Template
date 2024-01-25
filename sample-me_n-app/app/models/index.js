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
db.users = require("./user.model.js")(mongoose);

/************ Authentication roles ************/
db.roles = require("./role.model.js")(mongoose);
if(true){//TODO: change from TRUE to dev/debug/verify DBs in db.config.js
    db.ROLES = require("../config/db.config.js").roles;
}else{
    //TODO:db.ROLES = <import Roles from db ROLES table>
}
/********Authentication REFRESH TOKEN**********/
db.refreshToken = require("./refreshToken.model.js")(mongoose)

module.exports = db;