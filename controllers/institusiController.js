//Import model
var Mapel = require('../models/mapelModel');
var Session = require('../models/sessionModel');
var Pengguna = require('../models/userModelMahasiswa');

//Import library
var async = require('async');
var moment = require('moment');
var restClient = require('node-rest-client').Client;
var rClient = new restClient();
var base_api_url = 'http://localhost:3001';

//Import functions
const institusiFunction = require('../functions/institusiFunction');
const sessionFunction = require('../functions/sessionFunction');

//Import etc
const global = require('../global.json');

exports.daftar_mahasiswa = function(req,res){

  //Inisial validasi
  req.checkBody('access_token', global.pesan_gagal.session).notEmpty();
  req.checkBody('universitas', global.pesan_tidak_ditemukan.universitas).notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('universitas').escape();

  req.sanitize('access_token').trim();
  req.sanitize('universitas').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
    return res.json({success: false, data: errors})
  }else{
      //Promise Cek Session->Daftar Mahasiswa dalam Universitas
      //Promise Cek Session
      const promiseSession = new Promise(function (resolve, reject){
          sessionFunction.cek_status(req.body,function (callback) {
              if(callback){
                  console.log('berhasil session')
                  resolve(true)
              }else{
                  reject(global.pesan_gagal.session);
              }
          })
      });

      //Promise Daftar Universitas
      var daftarMahasiswa;
      const promiseDaftarMahasiswaPadaUniversitas = function(session){
          return new Promise(function(resolve, reject){
              if(session){
                  institusiFunction.daftar_mahasiswa_dalam_universitas(req.body, function(callback){
                      if(arguments[0]){
                          daftarMahasiswa = arguments[1]
                          resolve(true);
                      }else{
                          reject(arguments[1]);
                      }
                  })
              }else{
                  reject(global.pesan_gagal.mahasiswa_dalam_universitas)
              }
          })
      }

      //Atur Promise
      const consumePromise = function(){
          promiseSession
              .then(promiseDaftarMahasiswaPadaUniversitas)
              .then(function () {
                  return res.json({success: true, data: {message:global.pesan_berhasil.mahasiswa_dalam_universitas,data: daftarMahasiswa}})
              })
              .catch(function(err) {
                  return res.json({success: false, data: [{msg:err}]})
              })
      };

      consumePromise();
  }
}

exports.konfirmasi_mahasiswa = function(req,res){

    //Inisial validasi
    req.checkBody('access_token', global.pesan_gagal.session).notEmpty();
    req.checkBody('civitas_mahasiswa', global.pesan_tidak_ditemukan.civitas_mahasiswa).notEmpty();

    //Dibersihkan dari Special Character
    req.sanitize('access_token').escape();
    req.sanitize('civitas_mahasiswa').escape();

    req.sanitize('access_token').trim();
    req.sanitize('civitas_mahasiswa').trim();

    //Menjalankan validasi
    var errors = req.validationErrors();

    if(errors){//Terjadinya kesalahan
        return res.json({success: false, data: errors})
    }else{
        //Promise Cek Session->Ubah status mahasiswa menjadi diterima dari pending
        //Promise Cek Session
        const promiseSession = new Promise(function (resolve, reject){
            sessionFunction.cek_status(req.body,function (callback) {
                if(callback){
                    console.log('berhasil session')
                    resolve(true)
                }else{
                    reject(global.pesan_gagal.session);
                }
            })
        });

        //Promise Terima Mahasiswa
        const promiseTerimaMahasiswa = function(session){
            return new Promise(function(resolve, reject){
                if(session){
                    institusiFunction.konfirmasi_mahasiswa(req.body, function(callback){
                        if(callback){
                            resolve(true);
                        }else{
                            reject(global.pesan_gagal.konfirmasi_mahasiswa);
                        }
                    })
                }else{
                    reject(global.pesan_gagal.konfirmasi_mahasiswa)
                }
            })
        }

        //Atur Promise
        const consumePromise = function(){
            promiseSession
                .then(promiseTerimaMahasiswa)
                .then(function () {
                    return res.json({success: true, data: {message:global.pesan_berhasil.konfirmasi_mahasiswa}})
                })
                .catch(function(err) {
                    return res.json({success: false, data: [{msg:err}]})
                })
        };

        consumePromise();
    }
}

exports.daftar = function(req,res) {

  //Inisial validasi
  req.checkBody('access_token', global.pesan_gagal.session).notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();

  req.sanitize('access_token').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{
      //Promise Cek Session->Daftar Universitas yang terdaftar dalam TADJ
      //Promise Cek Session
      const promiseSession = new Promise(function (resolve, reject){
          sessionFunction.cek_status(req.body,function (callback) {
              if(callback){
                  console.log('berhasil session')
                  resolve(true)
              }else{
                  reject(global.pesan_gagal.session);
              }
          })
      });

      //Promise Daftar Universitas
      var daftarUniversitas;
      const promiseDaftarUniversitas = function(session){
          return new Promise(function(resolve, reject){
              if(session){
                  institusiFunction.daftar_universitas(req.body, function(callback){
                      if(arguments[0]){
                          daftarUniversitas = arguments[1]
                          resolve(true);
                      }else{
                          reject(arguments[1]);
                      }
                  })
              }else{
                  reject(global.pesan_gagal.daftar_universitas_mahasiswa)
              }
          })
      }

      //Atur Promise
      const consumePromise = function(){
          promiseSession
              .then(promiseDaftarUniversitas)
              .then(function () {
                  return res.json({success: true, data: {message:global.pesan_berhasil.daftar_universitas_mahasiswa,data: daftarUniversitas}})
              })
              .catch(function(err) {
                  return res.json({success: false, data: [{msg:err}]})
              })
      };

      consumePromise();
  }
}

exports.pending_daftar_mahasiswa = function(req,res) {

  //Inisial validasi
  req.checkBody('access_token', global.pesan_gagal.session).notEmpty();
  req.checkBody('idUniversitas', global.pesan_tidak_ditemukan.universitas).notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('idUniversitas').escape();

  req.sanitize('access_token').trim();
  req.sanitize('idUniversitas').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{

    args = {
      	data: {
          access_token: req.body.access_token},
      	headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    rClient.post(base_api_url+'/cek_session', args, function (data, response) {
        //Kelas.find({ _id:idKelas , pengajar: {$elemMatch:{mapel:idMapel,guru:idGuru}} }).exec(function (err, results) {

        if(data.success == true){//session berlaku
          var idUniversitas = req.body.idUniversitas
          console.log('id univ:'+idUniversitas)

            Pengguna.find()
           .elemMatch('akademik.universitas_prodi',{'universitas':idUniversitas,'status_konfirmasi':0})
           .select({})
           .exec(function (err, results) {

             if (err) {
               return res.json({success: false, data: err})
             }else{

               return res.json({success: true, data: results})

             }

           });

        }else{//session tidak berlaku
          return res.json({success: false, data: {message:'Token tidak berlaku'}})
        }

    })

  }

}

exports.kelompok_tambah = function (req,res) {
    //Inisial validasi
    req.checkBody('access_token', global.pesan_gagal.session).notEmpty();
    req.checkBody('universitas', global.pesan_tidak_ditemukan.jenjang).notEmpty();
    req.checkBody('jenjang', global.pesan_tidak_ditemukan.jenjang).notEmpty();
    req.checkBody('prodi', global.pesan_tidak_ditemukan.prodi).notEmpty();
    req.checkBody('semester', global.pesan_tidak_ditemukan.semester).notEmpty();
    req.checkBody('jumlah_anggota', global.pesan_tidak_ditemukan.jumlah_anggota).notEmpty();
    req.checkBody('tahun_ajaran', global.pesan_tidak_ditemukan.tahun_ajaran).notEmpty();
    req.checkBody('jumlah_kelompok', global.pesan_tidak_ditemukan.jumlah_kelompok).notEmpty();

    //Dibersihkan dari Special Character
    req.sanitize('access_token').escape();
    req.sanitize('universitas').escape();
    req.sanitize('jenjang').escape();
    req.sanitize('prodi').escape();
    req.sanitize('semester').escape();
    req.sanitize('jumlah_anggota').escape();
    req.sanitize('jumlah_kelompok').escape();

    req.sanitize('access_token').trim();
    req.sanitize('universitas').trim();
    req.sanitize('jenjang').trim();
    req.sanitize('prodi').trim();
    req.sanitize('semester').trim();
    req.sanitize('jumlah_anggota').trim();
    req.sanitize('jumlah_kelompok').trim();

    //Menjalankan validasi
    var errors = req.validationErrors();

    if(errors){//Terjadinya kesalahan
        return res.json({success: false, data: errors})
    }else{
        //Promise Cek Session->Tambah Kelompok TA pada universitas
        //Promise Cek Session
        const promiseSession = new Promise(function (resolve, reject){
            sessionFunction.cek_status(req.body,function (callback) {
                if(callback){
                    console.log('berhasil session')
                    resolve(true)
                }else{
                    reject(global.pesan_gagal.session);
                }
            })
        });

        //Promise Tambah Kelompok
        //var daftarMahasiswa;
        const promiseTambahKelompok = function(session){
            return new Promise(function(resolve, reject){
                if(session){
                    institusiFunction.tambah_kelompok(req.body, function(callback){
                        if(arguments[0]){
                            //daftarMahasiswa = arguments[1]
                            resolve(true);
                        }else{
                            reject(arguments[1]);
                        }
                    })
                }else{
                    reject(global.pesan_gagal.kelompok_tambah)
                }
            })
        }

        //Atur Promise
        const consumePromise = function(){
            promiseSession
                .then(promiseTambahKelompok)
                .then(function () {
                    return res.json({success: true, data: {message:global.pesan_berhasil.kelompok_tambah}})
                })
                .catch(function(err) {
                    return res.json({success: false, data: [{msg:err}]})
                })
        };

        consumePromise();
    }
}