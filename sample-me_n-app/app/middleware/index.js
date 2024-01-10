/*******************************************************
 * This file imports all our middleware for the project.
 * *****************************************************/
const jwtAuth = require("./jwtAuth.js");
const validateSignup = require("./validateSignup.js");
module.exports = {
    jwtAuth,
    validateSignup
};