const mongoose = require('mongoose')

const ItemSchema = new mongoose.Schema({
    // for arrays
    // itemLabelValue: [
    //     {
    //         name: {
    //             type: String,
    //             required: true,
    //             maxLength: 50
    //         },
    //         value: {
    //             type: String,
    //             required: true,
    //             maxLength: 50
    //         }
    //     }
    // ],
    // itemLabelOne: {
    //     name: {
    //         type: String,
    //         required: true,
    //         maxLength: 50
    //     },
    //     value: {
    //         type: String,
    //         required: true,
    //         maxLength: 50
    //     }
    // },
    itemLabelOne:{
        type: String,
        required: true,
        maxLength: 50
    },
    itemValueOne:{
        type: String,
        required: true,
        maxLength: 50
    },
    itemLabelTwo:{
        type: String,
        // required: true,
        maxLength: 50
    },
    itemValueTwo:{
        type: String,
        // required: true,
        maxLength: 50
    },
    description: {
      type: String,
      maxLength: 100
    },
    status: {
      type: String,
      required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    itemPhoto:{
        type: String
    },
    cloudinaryId: {
      type: String,
    },
    totalCost: {
        type: Number,
        required: true,
        maxLength: 100
    },
    currency: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        maxLength: 100
    },
    unit: {
        type: String,
        required: true,
        maxLength: 100
    },
    costPerUnit: {
        type: Number,
        required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
})


module.exports = mongoose.model('Item', ItemSchema)