# Docker Compose Nodejs and MongoDB template

## Why this project?
This is a sample project showcasing basic design and templating for a MEAN/MERN stack application this isn't proprietary. 
Mongo is a quick and easy document DB that is very popular. 
Node is one of the most popular JS web servers.
Express is one of the most popular web frameworks for Node.
And Mongoose is a straightforward promise-based ODM useful for small scale apps like this one.


## Start the sample project
Starting is as easy as one cammand (with docker engine & 
docker-compose installed on your system)
```bash
docker compose up -d
```

## Stop the sample project
Also a single command to remove all containers, but leave images, volumes, and networks in place:
```bash
docker compose down
```

To stop and remove all containers, networks, and all images used by any service in <em>docker-compose.yml</em> file, use the command:
```bash
docker compose down --rmi all
```
Note that this method removes the mongoDB data; be sure to use a separate volume if you intent to persist that data after an --rmi flag.

## Modifying and maintaining the project:
### Add new packages
First include all new packages in <em>package.json</em>:
```json
{
  ...
  "dependencies": {
    "packagename": "^1.0.0",
    ...
  }
}
```
and then you can import into server.js:
```js
require("packagename").exportname();
```

### Change business logic in the Controllers
Controllers are in the app/controllers/ directory
Presently, they are implemented using the CRUD promises
generated by Mongoose (see Modify Database Document Models
for more information), but you can change or make your own here.

Don't forget to create a router for your business logic APIs 
in /app/routes, and requiring it in the export in /routes/index.js.

#### Pagination
Certain controllers may return a lot of information at once. You
can manage the returned results for a number of webpage improvements,
such as:
- Faster initial page load response time
- better organization of the visual presentation
- Accessibility for those not running JavaScript
- Viewing results of complex business logic

... all by using server-side pagination. 

See the *Appendix* section for the Method: Using Mongoose for Pagination

### Access API through routers
Routes can be found in the app/routes/ directory

While controllers dictate what logic can be done, the routers
allow that logic to be accessed in the API. Each model should 
have its own controller and its own router.

routers should define the base path for this section of the
api, and the suffix path. Try to reuse the same suffix path 
for related POST/PUT/GET/DELETE commands, rather than making
a unique path for different functions on the same objects.

Once you create a router file (newroute.routes.js), you should 
include it in your routes index.js for import by server.js.

```js
module.exports = app => {
    require("./sample.routes")(app);
    require("./newroute.routes")(app);
};
```

This allows the app to import and use your new route on startup.



### Modify Database document models
Mongoose is used to represent the format for object documents
in mongoDB for us in order to keep sanity for programatically 
added data.

In a model such as the sample schema:
```js
module.exports = mongoose => {
  const Sample = mongoose.model(
    "sample",
    mongoose.Schema(
      {
        title: String,
        description: String,
        optionalProp: Boolean
      },
      { timestamps: true }
    )
  );

  return Sample;
};
```
the mongoose object, Sample, represents the Sample "Collection"
in the mongo DB. IN addtion to the three chosen properties, 
Mongoose will automatically add createdAt & updatedAt timestamps
(thanks to our timestamps option added above), a unique _id field,
and __v.

If this project is used as a template for a front-end which 
requires an "id" field instead of "_id", then you can override the
toJSON method like so:

```js
module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      title: String,
      description: String,
      optionalProp: Boolean
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Sample = mongoose.model("sample", schema);
  return Sample;
};
```

Mongoose creates our CRUD functions for us:
- Create: object.save()
- Retrieve/find by id: findById(id)
- Retrieve/find all objects by field-search: find({ fieldname: { $regex: new - RegExp(fieldname), $options: “i” } })
- Retrieve/find all objects: find()
- Update an object by id: findByIdAndUpdate(id, data)
- Delete/Remove an object by id: findByIdAndRemove(id)
- Delete/Remove all objects: deleteMany()



## Security Auth and RBAC with JWT
Using Token based authentication allows us to future proof this design
by allowing the authentication we are creating to work well with native
iOS/android mobile apps which cannot use sessions in the same way 
webapps alone do; at least not easily. Instead of returning a sessionID,
this will return a JWT which can be stored locally (web browser) in the
iOS keychain, or Android SharedPreferences when the time comes.

RBAC (Role Based Access Control) also allows us to manage large groups of users as easily as small groups of individuals by applying access controls to a small number of specific "roles," which can then be assigned to user profiles which inherit those roles' access abilities.

For an overview of how JWT works in greater detail 
and how it was implemented in this code, please 
look to the *Appendix* section at the bottom for 
"A Detailed Overview of JWT"


### Implementation of JWT Authentication and Authorization
We need to modify our architecture to add a few layers to the application.
Presently:

##### Previous Architecture:
1. HTTP Requests come in
2. They are picked up a valid router in node
3. They are validated by the CORS Middleware
  - They are then rejected by CORS && a response saying so is sent, OR
4. The request is sent to the routed controllers which can access our DB and perform business logic.

Our new architecture will inject an Authentication layer (JWT) and an 
Authorization Layer (we'll make here) to validate what any individual
authenticated user is allowed to do via *roles*.
 
##### New Architecture:
1. HTTP Requests come in
2. They are picked up a valid router in node
3. They are validated by the CORS Middleware
    - They are then rejected by CORS && a response saying so is sent, OR
    - CORS sees this as a valid request and:
4. The JWT Middleware verifies the JWT
    - The JWT is invalid and a 403 HTTP response is sent, OR
    - The JWT is valid, or the refresh token works and:
5. The Authorizatio Middleware now processes this JWT user's roles
    - The user does not have any of the roles stored in the Mongo auth DB records, OR
    - The user DOES have an appropriate role so:
6. The request is sent to the routed controllers which can access our DB and perform business logic.

Note that the Authorization middleware layer DOES have a DB connection,
but only for validating users and their level of access. The connection 
and "user" written for it to access the DB should be designed thusly.

##### Implementation package choices
We're going to use jsonwebtoken and bcryptjs for the authentication and 
hashing. The package "jsonwebtoken" is a simple package for JWTs, and bcryptjs is a fast javascript-only implementation of bcrypt. 
(One concern to note: bcrypt only uses the first 72bytes of data when 
matching passwords -- everything after that is ignored. 72 is still very 
strong, but something to think about in the future.)


#### Models Implementation
The first new code we need to implement for this architecture are the 
RBAC models for our DB. We will add them to *models/role.model.js*.
We will also add a "roles" object inside a new User model schema to 
incorporate these authentication changes going forward.

role.model:
```js
module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      name: String
    }
  );

  const Role = mongoose.model("role", schema);
  return Role;
};
```

user.model:
```js
...
  var schema = mongoose.Schema(
    {
      name: String,
      email: String,
      password: String,
      phone: String,
      //this the new role object:
      roles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Role"
        }
      ]
    },
    { timestamps: true }
  );
...
```
These mongoose models will represent the Roles and Users collection as *Normalized* documents in our MongoDB.
This Users schema will allow an array of Roles objects to be stored with this user, with one or many Roles IDs associated for our Authentication Middleware to refer to (or reference). Associating the roles as separate IDs (rather than denormalizing them and embedding authrization directly in each user record) allows us to keep the data Normalized, or separated into their uniquely managed areas without affecting the referencing documents. We can change roles without updating every user, and visa-versa.

#### Middleware
The middleware is used to handle things like validation and logic 
specific to making Authentication and Authorization work well, but
not the core logic. We're going to write two pieces which validate 
our JWT, and makes sure the JWT is/isn't an elevated user (admin or 
moderator), and also to validate user signup to avoid duplicate
users and incorrect user roles.

Check the middleware/validateSignup.js and middleware/jwtAuth.js for
examples.

#### Controllers
We need to dictate how to control 
- Authentication: How to know who this user is
- Authorization: RBAC, or What to let this user do.

##### Authenticate Controller
We need to allow users to sign up, so we learn who they are,
and to sign in, so we know who they are among returning users.

Our Sign up process will be a part of the user controller & have to:
- modify the example user controller to include a default role when not specified

Our Sign-in controller will be part of a new auth controller & have to:
- verify the username exists in the DB
- verify the supplied password matches the stored password
- generate an appropriate JWT
- Return useful user info and the access token (JWT).

We'll start with a user controller. We'll ensure the code incorporates
our new roles, and the "user" default role we require.

```js
...
//See the controllers/user.controller for the complete controller.
user.save(user)
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
...
```

And we'll need to add a new login/signin function as an auth controller:
```js
User.findOne({ username: req.body.username })
//then fetch all "roles" docs, too; exclude "__v" tag
.populate("roles","-__v") 
  .then((user) =>{
    //check password
    var passwordIsRight = bcrypt.compareSync(
      req.body.password, user.password);
    if (!passwordIsRight){
      return res.status(401).send({ message: "Invalid Password" });
    }
    else{//create JWT
      const token = jwt.sign({ id: user.id }, authConfig.secret,
                               {
                                 algorithm: 'HS256',
                                 allowInsecureKeySizes: true,
                                 expiresIn: 86400 //24 hours
                               });
      
      /*******DEBUG Roles assigned to user******/
      var assignedRoles = [];
      /** 
      user.roles.forEach(role => {
        assignedRoles.push(role.name.toUpperCase() + "_ROLE");
      });***************************************/
      res.status(200).send({
        id:       user._id,
        username: user.username,
        email:    user.email,
        roles:    assignedRoles,
        accessToken: token
      });
    }
  }
```
##### Routes
In order to use the earlier validations while using the new 
signup & signin controllers, we now need to modify the routes 
accordingly:
```js
...
const {validateSignup} = require("../middleware/validateSignup.js")

//Just for this route, we need special headers for the JWT
app.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});
// Create a new User; validate their info & requested roles with middleware
router.post("/signup",
            [validateSignup.checkDuplicateUsers
             validateSignup.validateUserRoles], 
             user.create);
```













# Appendix

## Detailed Overview of JWT
A JSon Web Token is comprised of 3 sections, all base64Url encoded, 
then separated by dots: an info `Header`, a data `Payload`, and a signed or encrypted `Signature`.
`HEADER.PAYLOAD.SIGNATURE`


#### Header
```json
{
  "typ": "JWT",
  "alg": "HS256"
}
```
Headers are almost always just these two required parts:
- `typ` is the type of token, JWT for this project
- `alg` is the Hashing Algorithm for generating the Signature token.
We are using HMAC-SHA256 to use a Secret Key, or HS256 for short. In future
projects, it will be worth using RSA and Public/Private key encryption instead.

#### Payload
```json
{
  //custom fields
  "sub": "123456fedcba",
  "username": "sampleuser",
  "email": "example@sample.com",
  "admin": "true",
  //standard fields
  "iss": "Example, author of Sample Site",
  "iat": 1637500704,
  "exp": 1637500740
}
```
The payload stores the relevant info we deem necessary for 
authentication in the form of "Claims," which are statements 
about the entity requesting the JWT. These claims can include 
username, id, and other identifying information.

##### Standard Payload Fields
In addition to these custom fields, there are a few built-in
pre-defined "Registered Claims" that we need to use. They are 
not mandatory, but are highly recommended (hence the pre-defined
nature):
- `iss` is the issuer of the JWT -- us.
- `iat` is the time the JWT was Issued AT.
- `exp` is the EXPiration time for this token.
Note these are all 3-chars long, as JWT is intended to be compact.

There are also Public Claims, which may overlap with fileds you want
to use, such as name, email, and sub (or user identifier) -- you should match these with 
the Claim names in the JWT Standard. All other claims are called 
"Private" claims, and will be defined by you in your own implementation.
More information on existing Public & Registered fields can be found here: 
https://www.iana.org/assignments/jwt/jwt.xhtml

##### Custom Payload Fields
It is important to note that JWT claim names should be kept short,
but more important that they are identifiable by your application.

Note that any information you provide in signed tokens is entirely 
readable by anyone, essentially plaintext. Do not include secret 
information like PII or passwords unless it is intended to be 
Publicly known. 

In our example, we included the user's name, email, and userid, but note
how we used "sub," one of the Public Claims outlined in the JWT definition
rather than a longer custom field like "userid."
Also note that we did not use their full name, password, or other 
non-public information. 
We also included a custom "admin" flag. Note that the client could 
alter this flag, now that they see it, which is why we will discuss 
validating your JWTs later (to avoid tampering).

#### Signature
The JWT signature requires the base64Url encoded header, encoded 
Payload, and a "secret" to all be signed by the algorithm defined 
*in* your header. This, altogether, is your JWT Signature.

```bash
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```
The signature is used to verify the message wasn't changed along the way, and, in the case of tokens signed with a private key, it can also verify that the sender of the JWT is who it says it is.

#### The Final Form: Putting all parts of the JWT together
The output is three base64Url strings which we'll separate by dots:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.
eyJzdWIiOiIxMjM0NTZmZWRjYmEiLCJ1c2VybmFtZSI6InNhbXBsZXVzZXIiLCJlbWFpbCI6ImV4YW1wbGVAc2FtcGxlLmNvbSIsImFkbWluIjoidHJ1ZSIsImlzcyI6IkV4YW1wbGUsIGF1dGhvciBvZiBTYW1wbGUgU2l0ZSIsImlhdCI6MTYzNzUwMDcwNCwiZXhwIjoxNjM3NTAwNzQwfQ.
mfUNVktcFx6tiMyZBy6qYMAjMJjMgLswkiSL5oq4g8w
```
Note this is the real JWT for our example, and uses an "example" secret.
You can test JWT creating out and test debugging here:
https://jwt.io/#debugger-io



## Using Mongoose for Pagination
There are many ways to utilize Pagination. The simpliest is 
using an offset & page size to find the specific records form the DB we want. This method is done easily in Mongoose with the package
Mongoose-pagination-v2

### Method: Mongoose-pagination-v2
The native MongoDB drivers and Express have great paginiation support built-in, but we're going to take advantage of the pagination offered
by Mongoose, since we already have it in place for our simple sample
project's models.

Mongoose-paginate-v2 shows pagination in the client via 
url parameters, page & size. "Page" dictates which group of items to 
show at one time, and "size" sets a `limit` on the 
number of results per page:

- /api/path/samples**?page=1&size=5**
  - specifies which page to view, and items per page 
- /api/path/samples**?size=5**
  - uses the default value for "page" number (0)
    - Note we always start with page 0, not 1
- /api/path/samples?title=example&page=1&size=3
  - paginates to 1st page, shows 3 items per page, & filters on "title"s containing ‘example’
- /api/path/samples/filterOpt?page=2
  - paginates (displaying page 2) & filter by ‘filterOpt’ status

And it will return a result response structure like so:

```json
{
    "totalItems": 8,
    "samples": [...],
    "totalPages": 3,
    "currentPage": 1
}
```
...where all data can be found inside the "samples" object we named.

#### Mongoose Pagination in controllers
Note that the examples above showed that the client sends a request 
with specific page number and size; but the Mongoose controller 
manages pagination with `limit` and `offset`.
- `limit` is the same as page "size"
- `offset` is the page number * pagesize
- And the first page is always "0"

For example, `/api/path/samples**?page=1&size=5**` will get a limit
of 5, and an offset of 1*5=5, so records 5-9 will be returned.

Since `limit` and `offset` are set from HTTP parameters, they are
optional in requests -- we should set default parameters for users to receive when no paging parameters are reveived in our paginated 
controller. This arrow function takes care of that for us, setting
the default page size to 10 & giving the first page as defaults:

```js
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};
```
And then this can be referenced inside each Business Logic function
to extract the supplied parameters OR provide the defaults when none
are provided:

```js
const { limit, offset } = getPagination(page, size);
```
View the paginated.controller controller for more examples.

#### Activate Pagination in calls
To use mongoose's pagination, we have to include it in the mongoose
schema, both passed to the schema in the exports function, and as
a schema.plugin:
```js
module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(...);

  schema.method("toJSON", function() {...});

  schema.plugin(mongoosePaginate);

  const Sample = mongoose.model("sample", schema);
  return Sample;
};
```
Note: mongoose and MongoosePaginate can be passed here after 
declaring them as a `const name=require('package')` inside 
the main models/index.js, and passing them in the `db.schema`
declaration/require statement thereafter:
```js /models/index.js
...
const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
...
db.samples = require("./sample.model.js")(mongoose, mongoosePaginate);
module.exports = db;
```

To access the pages, call the paginate function. Here we show an
example with custom labels, viewing the 4th page, with only 2 results
per page:
```js
Sample.paginate(condition, { offset: 3, limit: 2, customLabels: myCustomLabels })
  .then((result) => {
  });
```
View an example, find the paginated.model.js file.