//Model untuk pengguna sebagai dosen dan mahasiswa
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = Schema({
  email: {type: String, required: true},
  sandi: {type: String, required: true},
  status_konfirmasi: {type: Number, default: 0},
  profil:{
    username: {type: String, required: true},
    nama_lengkap: {type: String, default: '-'},
    bio: {type: String, default: '-'},
    foto_profil: {type: String, default: 'http://filehosting.pptik.id/TESISS2ITB/Vidyanusa/default-profile-picture.png'}
  },
  akademik:{
    peran: {type: Number, required: true},
    jenjang: {},
    universitas_prodi:{},
    gelar: {type: String, default: '-'},
    foto_ktm_ktp: {type: String, default: '-'},
    nim_nip: {type: String, default: '-'}
  },
  created_at: { type: Date, default: Date.now},
  updated_at: { type: Date, default: Date.now}
},{collection: 'pengguna'});

//Export model
module.exports = mongoose.model('pengguna', UserSchema);
