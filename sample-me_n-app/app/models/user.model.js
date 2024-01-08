/*************************************************
 * This file creates an example Model for a user
 * signing up with basic information.
 * 
 * TODO: Validation for signup-already-exists
 ************************************************/
module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      name: String,
      email: String,
      password: String,
      phone: String
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model("user", schema);
  return User;
};
