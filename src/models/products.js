let mongoose = require('mongoose')
let validator = require('validator')
// https://www.npmjs.com/package/validator

let productSchema = new mongoose.Schema({
  name: String,
  price: { type: Number, required: [true, 'A rating is needed for this product']},
});

module.exports = mongoose.model('Products', productSchema);