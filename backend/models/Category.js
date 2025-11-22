// const mongoose = require('mongoose');

// const CategorySchema = new mongoose.Schema({
//   name: {
//     type: String, 
//     required: true, 
//     unique: true 
//   },
//   description: { 
//     type: String,
//     requried:true
//   },
//   image:{
//     type: String, 
    
//   },
//   altText: { 
//     type: String 
//   }
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Category', CategorySchema);
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  altText: String,
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
