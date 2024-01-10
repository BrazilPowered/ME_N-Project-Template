/*******************************************************
 * This file imports all express routes for the project, 
 * each of which should be written to add their own path
 * to the app via app.use()
 * *****************************************************/
module.exports = app => {
    require("./sample.routes")(app);
    require("./paginated.routes")(app);
};