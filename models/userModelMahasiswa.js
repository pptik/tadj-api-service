//Model untuk pengguna sebagai dosen dan mahasiswa
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = Schema({
  _id: { type: Schema.ObjectId, auto: true},
  email: {type: String, required: true},
  sandi: {type: String, required: true},
  profil:{
    username: {type: String, required: true},
    nama_lengkap: {type: String, default: '-'},
    bio: {type: String, default: '-'},
    foto_profil: {type: String, default: 'http://filehosting.pptik.id/TESISS2ITB/Vidyanusa/default-profile-picture.png'}
  },
  akademik:{
    peran: {type: Number, required: true},
    universitas_prodi:[{
        universitas: {type: Schema.ObjectId, ref: 'universitas'},
        prodi: {type: Schema.ObjectId, ref: 'prodi'},
        jenjang: {type: Schema.ObjectId, ref: 'jenjang'},
        status_konfirmasi: {type: Number, default: 0},
        nim_nip: {type: String},
        kelompok: {type: Schema.ObjectId, ref: 'kelompok', default: null}
    }],
  },
  created_at: { type: Date, default: Date.now},
  updated_at: { type: Date, default: Date.now}
},{collection: 'pengguna'});

//Export model
module.exports = mongoose.model('pengguna', UserSchema);
