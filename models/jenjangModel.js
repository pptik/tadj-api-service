var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var JenjangSchema = Schema({
  nama: {type: String, required: true},
  prodi: [{type: Schema.ObjectId, ref: 'prodi'}],
  created_at: { type: Date, default: Date.now},
  updated_at: { type: Date, default: Date.now}
},{collection: 'prodi'});

//Export model
module.exports = mongoose.model('jenjang', JenjangSchema);
