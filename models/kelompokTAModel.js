var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var KelompokTASchema = Schema({
  no_kelompok: {type: String, required: true},
  universitas: {type: Schema.ObjectId, ref: 'universitas', required: true},
  prodi: {type: Schema.ObjectId, ref: 'prodi', required: true},
  semester: {type: Number, required: true},
  kuota: {type: Number, default: 3},
  tahun_ajaran: {type: String, required: true},
  created_at: { type: Date, default: Date.now},
  updated_at: { type: Date, default: Date.now}
},{collection: 'kelompok_ta'});

//Export model
module.exports = mongoose.model('kelompok_ta', KelompokTASchema);
