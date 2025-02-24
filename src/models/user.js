const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require("bcrypt");
const jwt =  require("jsonwebtoken")

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:4

    },
    lastName:{
        type:String,
        },
    emailId:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error("Invalid Email")
            }
        }
    },
    password:{
        type:String,
        required:true

    },
    age:{
        type:Number,
        min:18
    },
    gender:{
        type:String,
        validate(value){
            if (!["male","female","other"].includes(value)){
                throw new Error("Invalid gender");
            }
        }
    },
    photoUrl:{
        type:String,
        default:"https://www.google.com/url?sa=i&url=https%3A%2F%2Fstackoverflow.com%2Fquestions%2F49917726%2Fretrieving-default-image-all-url-profile-picture-from-facebook-graph-api&psig=AOvVaw0wqUFKQbe3S9U_rD6Ljlmp&ust=1739326909699000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCMjI1-bHuosDFQAAAAAdAAAAABAE",
        validate(value){
            if (!validator.isURL(value)){
                throw new Error("Invalid URL")
            }
        }
    },
    skills:{
        type:[String]
    }
},{timestamps:true})

userSchema.methods.getJWT = async function(){
    const token = jwt.sign({_id:this._id},"lenindev",{expiresIn:"1d"})
        return token;
}
userSchema.methods.validatePassword= async function(inpuTpassword){
    const isValid = await bcrypt.compare(inpuTpassword,this.password)
    return isValid;
}

module.exports = mongoose.model("User",userSchema);  //exporting the model