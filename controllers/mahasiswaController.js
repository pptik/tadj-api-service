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
const mahasiswaFunction = require('../functions/mahasiswaFunction');
const sessionFunction = require('../functions/sessionFunction');

//Import etc
const global = require('../global.json');

exports.daftar_universitas = function(req,res){

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('pengguna', 'Id pengguna tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('pengguna').escape();

  req.sanitize('access_token').trim();
  req.sanitize('pengguna').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
    return res.json({success: false, data: errors})
  }else{
      //Promise Cek Session->Daftar Universitas pengguna mahasiswa
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
                  mahasiswaFunction.daftar_universitas(req.body, function(callback){
                      if(arguments[0]){
                          daftarUniversitas = arguments[1]
                          resolve(true);
                      }else{
                          reject(global.pesan_gagal.daftar_universitas_mahasiswa);
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

exports.tambah_institusi_pendidikan = function(req,res){

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('pengguna', 'Id pengguna tidak boleh kosong').notEmpty();
  req.checkBody('institusi', 'Id institusi tidak boleh kosong').notEmpty();
  req.checkBody('jenjang', 'Id jenjang tidak boleh kosong').notEmpty();
  req.checkBody('prodi', 'Id prodi tidak boleh kosong').notEmpty();
  req.checkBody('nim', 'NIM tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('pengguna').escape();
  req.sanitize('institusi').escape();
  req.sanitize('jenjang').escape();
  req.sanitize('prodi').escape();
  req.sanitize('nim').escape();

  req.sanitize('access_token').trim();
  req.sanitize('pengguna').escape();
  req.sanitize('institusi').trim();
  req.sanitize('jenjang').trim();
  req.sanitize('prodi').trim();
  req.sanitize('nim').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{
      //Promise Cek Session->Menambahkan universitas kepada mahasiswa
      //Promise Cek Session
      const promiseSession = new Promise(function (resolve, reject){
          sessionFunction.cek_status(req.body,function (callback) {
              if(callback){
                  resolve(true)
              }else{
                  reject(global.pesan_gagal.session);
              }
          })
      });

      //Promise Menambahkan Universitas kepada mahasiswa
      const promiseMenambahkanUniversitas = function(session){
          return new Promise(function(resolve, reject){
              if(session){
                  mahasiswaFunction.menambahkan_institusi_prodi_jenjang(req.body, function(callback){
                      if(arguments[0]){
                          resolve(true);
                      }else{
                          reject(global.pesan_gagal.menambahkan_universitas);
                      }
                  })
              }else{
                  reject(global.pesan_gagal.menambahkan_universitas)
              }
          })
      }

      //Atur Promise
      const consumePromise = function(){
          promiseSession
              .then(promiseMenambahkanUniversitas)
              .then(function () {
                  return res.json({success: true, data: {message:global.pesan_berhasil.menambahkan_universitas}})
              })
              .catch(function(err) {
                  return res.json({success: false, data: [{msg:err}]})
              })
      };

      consumePromise();
  }
}
