let mongoose = require('mongoose')
let validator = require('validator')
// https://www.npmjs.com/package/validator

let productSchema = new mongoose.Schema({
    name: String,
    brand: String,
    price: { type: Number, required: [true, 'A rating is needed for this product']},
    quantity: { type: Number, required: [true, 'A rating is needed for this product']},
    totalPrice: { type: Number, required: [true, 'A rating is needed for this product']},
  });

let ticketSchema = new mongoose.Schema({
  username: {type: String},
  totalPrice: { type: Number, required: [true, 'A rating is needed for this product']},
  products: [productSchema]
});

module.exports = mongoose.model('Ticker', ticketSchema);