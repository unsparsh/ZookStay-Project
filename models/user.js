const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type:String,
        required : true
    }
});

/* other than email,
id 
username;
slat and hash will be added by passprt automatically*/

userSchema.plugin(passportLocalMongoose);
//apne aap username hash and salting add kar dega passport-local-mongoose
module.exports = mongoose.model('User',userSchema);