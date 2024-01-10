/******************************************************************
 * ME_N Stack Template: Functional backend/middle tier Template for
 * any front-end of choice. In this example:
 *         A simple vote collector
 ******************************************************************/
/***************************************
 * Imports: 
 * config, db model, node modules, and
 * port to listen for requests
 ***************************************/
require("dotenv").config();         //may be redundant in future(node 20.6+)
const db = require("./app/models"); //db models
const express = require("express"); //REST API creation
const cors = require("cors");       //enable CORS & options 
// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 8080;

/***************************************
 * Create & configure Express middleware
 * Plus mongoos for DB connection
 ***************************************/
const app = configExpress(express(), PORT);
configconnectdatabase(db);

/***************************************
 * Basic Routes (example)
 ***************************************/
app.get("/get_test", (req, res) => {
  res.json({ message: "Here, the ME_N Template's GET works!" });
});

app.get('/',function(req,res){
  res.set({
    'Access-control-Allow-Origin': '*'
    });
  return res.redirect('signup.html');
  });
  
require("./app/routes")(app);




/******************************************************************
 * Configuring Functions
 ******************************************************************/
function configExpress(app, port){
  var corsOptions = {
    origin: "http://localhost:8081"
  };
  
  app.use(cors(corsOptions));
  
  // parse requests of content-type - application/json
  app.use(express.json());
  
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));

  // set folder for static (non-dynamic) files like html, css, and images
	app.use(express.static('public'));

  //set the port to listen for requests
  app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
  });

  return app;
}

/*******************************
 * Configure Database connection 
 * This time using Mongoose
 *******************************/
function configconnectdatabase(db){
  console.log(db.url);
  db.mongoose
    .connect(db.url, {
      family: 4           /*default is IPV6, most dev using ipv4*/
//      ,dbName: $dbname  /*for debug isolating db overriding connection string fails*/
/*      ,user: $user      //for debugging login auth when connection string fails//
        ,pass: $pass      //for debugging login auth when connection string fails*/
//      ,authsource: authDBName //set db that stores users when NOT using 'auth' DB
                  //authSource is needed when user for this app is scoped to single db
      ,
    })
    .then(() => {
      console.log("Connected to the database!");
      //TODO: Validate DB data that is required for app functionality.
    })
    .catch(err => {
      console.log("Cannot connect to the database!", err);
      process.exit();
    });
  //return db
}