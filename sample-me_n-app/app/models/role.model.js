/*************************************************
 * This file creates a Model for an RBAC role
 * to be stored in a DB
 ************************************************/
module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      name: String
    }
  );

  const Role = mongoose.model("role", schema);
  return Role;
};
