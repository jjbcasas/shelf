const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50
    },
    description: {
      type: String,
      maxLength: 100
    },
    items: {
      type: Number,
      required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoryPhoto:{
        type: String
    },
    cloudinaryId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
})


module.exports = mongoose.model('Category', CategorySchema)