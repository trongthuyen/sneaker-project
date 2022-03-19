const mongoose = require('mongoose');

const sneakerSchema = new mongoose.Schema({
  price: {
    type: Number,
    require: [true, 'Sneaker price is required']
  },
  slug: String,
  importedDate: {
    type: Date,
    default: Date.now()
  },
  name: {
    type: String,
    require: [true, 'Sneaker name is required'],
    trim: true,
    maxlength: [80, 'A sneaker name must have less or equal then 80 characters']
  },
  type: {
    type: String,
    enum: ['laptop', 'phone', 'accessorie']
  },
  description: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,

    required: [
      true,
      'Must specify the currently number of product in inventory'
    ]
  },
  brand: {
    type: String,
    required: [true, 'A sneaker must has a brand']
  },
  discount: {
    type: Number,
    min: [0, 'The discount must be greater or equal zero'],
    max: [1, 'The discount must be smaller or equal 1']
  },
  image: [String]
});

const sneaker = mongoose.model('Sneaker', sneakerSchema);

module.exports = sneaker;
