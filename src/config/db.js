const mongoose = require("mongoose");

const dbConnect = async()=>{
try {
   await mongoose.connect("mongodb+srv://mohapatral1:lenin12345@cluster0.1wek7.mongodb.net/devTinder?retryWrites=true&w=majority&appName=Cluster0")
   console.log("DB connected");
}
    
catch (error) {
    console.log(error.message);
    
}

}
    
   


module.exports = dbConnect;