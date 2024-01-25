/*************************************************
 * This file creates a Model for JWT Refresh Tokens.
 * 
 * While the JWT Library handles tokens well on 
 * its own, we need to keep track of our own tokens
 * for Refreshing those sessions.
 ************************************************/
const authConfig = require("../config/auth.config");
const crypto = require("crypto");
//const mongoose = require("mongoose");
module.exports = mongoose => {
    var schema = new mongoose.Schema({
        token: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        expiration: { 
            type: Date, 
            index: {expireAfterSeconds: 0}//Mongo now Auto-removes this token when 'expiration' is < current time in seconds
        }
    });

    /********************************************
     * This statics function outlines the ceation 
     * of every refresh token we'll track in our 
     * DB, saving it at the end && returning it.
     ********************************************/
    schema.statics.createToken = async function (user) {
        let expiration = new Date();

        //set expiration for this token in the future from now
        expiration.setSeconds(
            expiration.getSeconds() + authConfig.jwtRefreshExpiration
        );

        let _token = crypto.randomUUID();

        let _object = new this({
            token: _token,
            user: user._id,
            expiration: expiration.getTime(),
        });
        //debugging
        console.log(_object);
        let refreshToken = await _object.save();

        return refreshToken.token;
    };

    /******************************************
     * Verify token expiration by seeing token 
     * time LESS THAN getTime NOW.
     ******************************************/
    schema.methods.stillValid = function stillValid() {
        return valid = this.expiration.getTime() >= new Date().getTime();
    }//Note: this is handled by the "expireAfterSeconds" index option, but there may be time between index auto-removal and expiration time

    const RefreshToken = mongoose.model("refreshToken", schema);
    return RefreshToken;
};