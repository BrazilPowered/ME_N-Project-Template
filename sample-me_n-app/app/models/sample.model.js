/*************************************************
 * This file creates a Sample Model for an object
 * to be stored in a DB
 * 
 * TODO: Validation for object-already-exists
 ************************************************/
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
