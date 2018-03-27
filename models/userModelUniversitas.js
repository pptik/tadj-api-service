//Model untuk pengguna sebagai siswa
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = Schema({
  email: {type: String, min: 1, max: 100, required: true},
  sandi: {type: String, min: 1, max: 100, required: true},
  profil:{
    username: {type: String, min: 1, max: 100, required: true},
    nama_lengkap: {type: String, min: 1, max: 100, required: true},
    jenis_kelamin: {type: String, min: 1, max: 100, required: true},
    foto: {type: String, min: 1, max: 100, default: 'http://filehosting.pptik.id/TESISS2ITB/Vidyanusa/default-profile-picture.png'},
    bio: {type: String, min: 1, max: 100, default: '-'}
  },
  akademik:{
    jenjang: [{type: Schema.ObjectId, ref: 'jenjang'}]    
  },
  civitas: {
    mahasiswa: [{
        _id: { type: Schema.ObjectId, auto: true},
        pengguna: {type: Schema.ObjectId, ref: 'pengguna'},
        prodi: {type: Schema.ObjectId, ref: 'prodi'},
        jenjang: {type: Schema.ObjectId, ref: 'jenjang'},
        status_konfirmasi: {type: Number, default: 0},
        nim_nip: {type: String},
        kelompok: {type: Schema.ObjectId, ref: 'kelompok', default: null}
    }],
    dosen: [{
        pengguna: {type: Schema.ObjectId, ref: 'pengguna'}
    }]
  },
  created_at: { type: Date, default: Date.now},
  updated_at: { type: Date, default: Date.now}
},{collection: 'pengguna'});

//Export model
module.exports = mongoose.model('penggunaUniversitas', UserSchema);
