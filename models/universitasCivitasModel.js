var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UniversitasCivitasSchema = Schema({
  peran: {type: Number},
  universitas: {type: Schema.ObjectId, ref: 'universitas'},
  prodi: {type: Schema.ObjectId, ref: 'prodi'},
  jenjang: {type: Schema.ObjectId, ref: 'jenjang'},
  status_konfirmasi: {type: Number, default: 0},
  foto_ktm_ktp: {type: String, default: '-'},
  nim_nip: {type: String, default: '-'}
},{collection: 'universitas_civitas'});

//Export model
module.exports = mongoose.model('universitas_civitas', UniversitasCivitasSchema);
