var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UniversitasSchema = Schema({
  pengguna: {type: String, required: true},
  nama: {type: String, required: true},
  created_at: { type: Date, default: Date.now},
  updated_at: { type: Date, default: Date.now}
},{collection: 'universitas'});

//Export model
module.exports = mongoose.model('universitas', UniversitasSchema);
