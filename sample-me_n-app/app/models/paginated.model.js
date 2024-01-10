/*************************************************
 * Pagination Example
 * 
 * This file creates a sample Model for an object
 * to be stored in a DB. It will be used to 
 * showcase paginatin when GETting results from db.
 * 
 * TODO: Validation for object-already-exists
 ************************************************/
module.exports = (mongoose, mongoosePaginate) => {
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

  //Include the mongoose-paginate-v2 plugin...
  schema.plugin(mongoosePaginate);
  const Paginated = mongoose.model("paginated", schema);

  /**************************
   * Using pagination:
   * TODO: define result and error messages.
   * * * * * * * * *
  Paginated.paginate(yourQuery, options)
    .then(result => {})
    .catch( err => {});
  return Paginated;
  ***************************/
};
