/*********************************************************
 * Initial first-run configuration for this app. 
 * 
 * These are used to create:
 * - the initial roles in mongoDB
 **********************************************************/
const { roles } = require("./db.config");
/*******************************
 * This should only be run the first time the DB is created.
 * Initializes MongoDB with Data
 * 
 * 
 * -ONLY RUN ONCE ON FIRST SETUP-
 *******************************/
module.exports = (db) => {
    /****************************
     * Roles in Role Collection */
    const Role = db.roles;
    Role.estimatedDocumentCount()
    .then((count) => {
        if (count === 0) {
            console.log("No Roles found in DB; adding from config now.")
            roles.forEach((role)=>
            {
                new Role({ name: role })
                .save()
                .then(role => {
                    console.log("added '"+role.name+"' to roles collection");
                });
            })
        } else{
            console.log("Existing Roles found in Roles collection. Skipping Role Creation")
        }
    })
    .catch((err) => {
      console.log("error", err);
    });
  
  
    return roles;
};