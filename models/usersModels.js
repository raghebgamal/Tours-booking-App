const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userSchema =new mongoose.Schema({
    name: {
        type: String,
        required: [true, "user must have a name"]
    },
    email: {
        type: String,
        required: [true, "user must have an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "plz provide a valid email"]
    },
    photo: {
        type: String,
        default:"default.jpg"
    },
    password: {
        type: String,
        required: [true, "please provide your password"],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
        
    }
    ,
    passwordConfirm: {
        type: String,
        required: [true, "please confirm your password"],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "passwords are not the same "
        }
    },
    passwordChangedAt: {
        type: Date
        
    },
    passwordResetToken: {
        type: String
        
    },
    passwordResetExpired: Date,
    active: {
        type: Boolean,
        default: true,
        select:false
    }

}, {
    toJSON: { virtuals: true },
    toObject:{ virtuals: true }
})
    

userSchema.pre("save",async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
})
userSchema.pre("save",async function (next) {
    if (!this.isModified("password")||this.isNew) return next();

    this.passwordChangedAt=Date.now()-1000
    next();
})

userSchema.methods.correctPassword =  async function (candidatePassword,userPassword) {
  

    return await bcrypt.compare(candidatePassword, userPassword);
}
userSchema.methods.passwordChangedAfter = function (jwtTimestamb) {
    if (this.passwordChangedAt) {
        const changedtime=parseInt( this.passwordChangedAt.getTime()/1000,10)
        console.log(changedtime, jwtTimestamb);
        return jwtTimestamb < changedtime;
    }
    return false
}
userSchema.methods.correctPasswordReset = function () {
    const tokencrypto = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(tokencrypto).digest("hex");
    this.passwordResetExpired = Date.now() + 10 * 60 * 1000;
    return tokencrypto;
    
};

userSchema.pre(/^find/, function (next) {
   
   this.find({ active:{$ne:false}  })
 
    
    next();
})

const User = mongoose.model("User", userSchema);
module.exports = User;

