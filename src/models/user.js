const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  ACCESS_SECRET,
  REFRESH_SECRET,
  ACCESS_EXPIRY,
  REFRESH_EXPIRY,
} = require("../config/jwt");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Invalid gender");
        }
      },
    },
    photoUrl: {
      type: String,
      default: "https://via.placeholder.com/400x500?text=User+Profile",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL");
        }
      },
    },
    skills: {
      type: [String],
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });
};

userSchema.methods.validatePassword = async function (inpuTpassword) {
  const isValid = await bcrypt.compare(inpuTpassword, this.password);
  return isValid;
};

module.exports = mongoose.model("User", userSchema); //exporting the model
