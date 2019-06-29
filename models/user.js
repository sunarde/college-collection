var mongoose = require ("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({

    firstname: String,
    lastnmae:String,
    username: String,
    password: String,
    college:String,
    gender: String,
    mobile: Number
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);