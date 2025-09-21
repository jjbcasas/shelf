const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true
    },
    // For Google SignIn
    googleId: {
      type: String
    },
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: String,
    cloudinaryId: {
      type: String,
    },
    profileImage: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
}/*, { //this is for automatic creation of createdAt and UpdatedAt
  timestamps: true
}*/)

// Password hash middleware.
UserSchema.pre('save', function save(next) {
  const user = this
  if (!user.isModified('password')) { return next() }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err) }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err) }
      user.password = hash
      next()
    })
  })
})


// Helper method for validating user's password.
UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch)
  })
}

module.exports = mongoose.model('User', UserSchema)