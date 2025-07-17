const validator = require("validator")


const validation = (req)=>{

    const {firstName,emailId,password} = req.body
      if (!firstName ){
          throw new Error("name required")
      }else if (!validator.isEmail(emailId)){
        throw new Error("valid email required")

      }else if (!validator.isStrongPassword(password)){
        throw new Error("password should be strong")
      }
}
const validateEditProfile=(req)=>{
  const editableKey = ["firstName","lastName","photoUrl","skills","age","gender"]
  const isValiidate = Object.keys(req.body).every((each)=>{
    return editableKey.includes(each)
  })
  
  return isValiidate;
}

module.exports ={
    validation,
    validateEditProfile
}