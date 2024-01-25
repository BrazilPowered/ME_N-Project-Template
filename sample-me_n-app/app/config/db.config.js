/*********************************************************
 * Mongo db configuration for this app. This is able to be
 * read from process.env because of the dotenv package's 
 * "config", imported in our server.js.
 * 
 * Starting node with "node --env-file=XXXXXX" option may 
 * make this method redundant going forward (post-Node:20.6)
 **********************************************************/
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;
const roles = ["admin","moderator","user"];
/**********************************
 * the authsource parameter allows 
 * us to login as this user with
 * admin access configured through 
 * the "admin" db
 **********************************/
module.exports = {
  url: `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`,
  roles: roles
};
