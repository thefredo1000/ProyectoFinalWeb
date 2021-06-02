let mongoose = require('mongoose')
let validator = require('validator')
const bcrypt = require("bcryptjs")

// https://www.npmjs.com/package/validator

let userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  avatar:{
      data: Buffer,
      contentType: String
  }
});


userSchema.pre("save", function (next) {
    const user = this
  
    if (this.isModified("password") || this.isNew) {
      bcrypt.genSalt(10, function (saltError, salt) {
        if (saltError) {
          return next(saltError)
        } else {
          bcrypt.hash(user.password, salt, function(hashError, hash) {
            if (hashError) {
              return next(hashError)
            }
  
            user.password = hash
            next()
          })
        }
      })
    } else {
      return next()
    }
  })

module.exports = mongoose.model('Users', userSchema);