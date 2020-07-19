const mongoose = require('mongoose')
const Schema = mongoose.Schema

const salesSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: {
      type: String
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('sales',salesSchema)
