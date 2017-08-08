var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProdiSchema = Schema({
  nama: {type: String, required: true},
  created_at: { type: Date, default: Date.now},
  updated_at: { type: Date, default: Date.now}
},{collection: 'prodi'});

//Export model
module.exports = mongoose.model('prodi', ProdiSchema);
