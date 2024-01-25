/*********************************************************
 * JWT configuration for this app. These options are key to 
 * configuring our JWT creation and management
 * 
 * This is able to be read from process.env because of the
 *  dotenv package's "config", imported in our server.js.
 * 
 * Starting node with "node --env-file=XXXXXX" option may 
 * make this method redundant going forward (post-Node:20.6)
 **********************************************************/
const {
    JWT_SECRET,
    JWT_EXPIRATION_TIME,
    JWT_REFRESH_EXPIRE_TIME
  } = process.env;
  
  /**********************************
   * this key is used for the 
   * encryption of the JWT Signature.
   **********************************/
  module.exports = {
    secret: JWT_SECRET,
    jwtExpiration: JWT_EXPIRATION_TIME,
    jwtRefreshExpiration: JWT_REFRESH_EXPIRE_TIME
};
  