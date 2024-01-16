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













# Appendix

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